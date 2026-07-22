import cron from "node-cron";
import { PrismaClient } from "@prisma/client";
import axios from "axios";

import { fetchSteamStoreDetails, fetchGamePlaytimes } from "../utils/steam";

const prisma = new PrismaClient();

async function handleActiveUserSession(
  userId: string,
  activeGameId: number,
  gameName: string,
) {
  try {
    let game = await prisma.game.findUnique({
      where: { steamAppid: activeGameId },
    });

    if (!game) {
      const storeDetails = await fetchSteamStoreDetails(activeGameId);
      const playtimes = await fetchGamePlaytimes(gameName);

      game = await prisma.game.create({
        data: {
          steamAppid: activeGameId,
          name: gameName,
          genres: storeDetails.genres,
          mainStory: playtimes.mainStory,
          completionist: playtimes.completionist,
          logoUrl: storeDetails.logoUrl,
          iconUrl: storeDetails.iconUrl,
        },
      });
      console.log(`✅ [Catalog] Created global entry for: "${gameName}"`);
    }

    let gameInfo = await prisma.gameInformation.findFirst({
      where: {
        userId: userId,
        steamAppid: activeGameId,
      },
    });

    if (!gameInfo) {
      console.log(
        `[Cron] Adding "${gameName}" to User ${userId}'s local library instance.`,
      );
      gameInfo = await prisma.gameInformation.create({
        data: {
          userId: userId,
          steamAppid: activeGameId,
          recentHoursPlayed: 0,
          totalHoursPlayed: 0,
          achievements: { unlocked: 0, total: 0, percentage: 0 },
        },
      });
    }

    const activeSession = await prisma.session.findFirst({
      where: {
        userId: userId,
        gameId: gameInfo.id,
        endAt: null,
      },
    });

    if (!activeSession) {
      console.log(
        `🎬 [Session Started] Creating new session for ${gameName} (User: ${userId})`,
      );

      await prisma.session.create({
        data: {
          userId: userId,
          gameId: gameInfo.id,
          startAt: new Date(),
          endAt: null,
        },
      });
    } else {
      console.log(
        `⏳ [Session Ongoing] Active session already exists for ${gameName}.`,
      );
    }
  } catch (error: any) {
    console.error(
      `[Cron Session Handler Error] Failed processing user ${userId}:`,
      error.message,
    );
  }
}

async function handleInactiveUserSession(userId: string) {
  try {
    const activeSession = await prisma.session.findFirst({
      where: {
        userId: userId,
        endAt: null,
      },
      include: {
        gameInstance: true,
      },
    });

    if (activeSession) {
      const now = new Date();

      const durationMs = now.getTime() - activeSession.startAt.getTime();
      const durationMinutes = Math.round(durationMs / 1000 / 60);

      const sessionHours = durationMinutes / 60;

      const isFirstTimePlay =
        !activeSession.gameInstance ||
        !activeSession.gameInstance.totalHoursPlayed;
      const baselineHours = isFirstTimePlay
        ? 0
        : activeSession.gameInstance.totalHoursPlayed;

      const newCumulativeHours = baselineHours + sessionHours;

      console.log(
        `🛑 [Session Ended] Closing session ${activeSession.id} for Game ID ${activeSession.gameInstance.steamAppid}. Duration: ${durationMinutes} mins (${sessionHours.toFixed(2)} hours).`,
      );

      await prisma.$transaction([
        prisma.session.update({
          where: { id: activeSession.id },
          data: {
            endAt: now,
            totalDuration: durationMinutes,
          },
        }),

        prisma.gameInformation.update({
          where: { id: activeSession.gameId },
          data: {
            totalHoursPlayed: {
              increment: sessionHours,
            },
            recentHoursPlayed: {
              increment: sessionHours,
            },
          },
        }),

        prisma.playtimeCheck.create({
          data: {
            sessionId: activeSession.id,
            gameId: activeSession.gameInstance.steamAppid,
            cumulativePlaytime: newCumulativeHours,
            checkedAt: now,
          },
        }),
      ]);

      console.log(
        `✅ [Database Synchronized] Playtime added to user's library.`,
      );
    }
  } catch (error: any) {
    console.error(
      `[Cron] Error closing session for user ${userId}:`,
      error.message,
    );
  }
}

export const initPlaytimeCron = () => {
  // schedules a job / 3 mins
  cron.schedule("*/3 * * * *", async () => {
    console.log("[Cron] Checking for playtime updates...");

    try {
      // list of users
      const users = await prisma.userProfile.findMany({
        select: {
          id: true,
          displayName: true,
        },
      });

      if (users.length === 0) {
        console.log("[Cron] No users in database to track.");
        return;
      }

      const steamIdsString = users.map((u) => u.id).join(",");

      const response = await axios.get(
        "http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/",
        {
          params: {
            key: process.env.STEAM_API_KEY,
            steamids: steamIdsString,
          },
        },
      );

      const players = response.data.response.players || [];

      for (const player of players) {
        const localUser = users.find((u) => u.id === player.steamid);
        const username = localUser?.displayName || player.personaname;

        if (player.gameid) {
          // 🎮 1. User is currently playing a game
          console.log(
            `🎮 [Active] ${username} is currently playing: "${player.gameextrainfo}"`,
          );

          await handleActiveUserSession(
            localUser.id, // userId: string
            Number(player.gameid), // activeGameId: number
            player.gameextrainfo, // gameName: string
          );
        } else {
          // 💤 2. User is not playing any game
          await handleInactiveUserSession(localUser.id);
        }
      }
    } catch (error: any) {
      console.error(
        "[Cron Error] Failed to fetch player summaries:",
        error.message,
      );
    }
  });
};
