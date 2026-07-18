import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import axios from "axios";

const STEAM_API_KEY = process.env.STEAM_API_KEY;
const prisma = new PrismaClient();

// reading game information
export const getGameInformationDetails = async (
  req: Request,
  res: Response,
) => {
  try {
    const { userId, steamAppid } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: "User ID is required to find game information",
      });
    }
    if (!steamAppid) {
      return res.status(400).json({
        success: false,
        error: "Steam app Id is required to find game information",
      });
    }

    const gameInfo = await prisma.gameInformation.findUnique({
      where: {
        userId_steamAppid: {
          userId: userId,
          steamAppid: Number(steamAppid),
        },
      },
      include: {
        gameCatalog: true,
      },
    });

    if (!gameInfo) {
      return res.status(404).json({
        success: false,
        error: "Game information record not found for this user.",
      });
    }

    return res.status(200).json({
      success: true,
      gameInfo,
    });
  } catch (error: any) {
    console.error("User game information retrieval error:", error);
    return res.status(500).json({
      success: false,
      error: "Internal Server Error",
      debug: error.message,
    });
  }
};

// get topGamesList
export const getTopGamesList = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: "User ID is required to find game information",
      });
    }

    const gameInfo = await prisma.gameInformation.findMany({
      where: {
        userId: userId,
        totalHoursPlayed: {
          gt: 0,
        },
      },
      orderBy: {
        totalHoursPlayed: "desc",
      },
      include: {
        gameCatalog: {
          select: {
            steamAppid: true,
            name: true,
            iconUrl: true,
          },
        },
      },
    });

    if (gameInfo.length === 0) {
      return res.status(200).json({
        success: true,
        games: [],
        message: "No games found for this user.",
      });
    }

    return res.status(200).json({
      success: true,
      games: gameInfo,
    });
  } catch (error: any) {
    console.error("User game information retrieval error:", error);
    return res.status(500).json({
      success: false,
      error: "Internal Server Error",
      debug: error.message,
    });
  }
};

export const getTopPlayedTags = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID parameter is required.",
      });
    }

    const userGames = await prisma.gameInformation.findMany({
      where: { userId },
      include: {
        gameCatalog: true,
      },
    });

    if (!userGames || userGames.length === 0) {
      return res.status(200).json({
        success: true,
        genres: [],
      });
    }

    const genreMap: Record<string, number> = {};

    for (const record of userGames) {
      const hours = record.totalHoursPlayed || 0;
      const genres = record.gameCatalog?.genres;

      if (Array.isArray(genres)) {
        for (const genre of genres) {
          if (typeof genre === "string") {
            genreMap[genre] = (genreMap[genre] || 0) + hours;
          }
        }
      }
    }

    const sortedGenres = Object.entries(genreMap)
      .map(([name, totalHours]) => ({
        name,
        totalHours: parseFloat(totalHours.toFixed(1)),
      }))
      .sort((a, b) => b.totalHours - a.totalHours)
      .slice(0, 5);

    return res.status(200).json({
      success: true,
      genres: sortedGenres,
    });
  } catch (error: any) {
    console.error("Error fetching top played tags:", error);
    return res.status(500).json({
      success: false,
      error:
        error.message || "Internal server error while calculating top genres.",
    });
  }
};

// updateAchievements
export const syncAllAchievementsInDatabase = async (
  req: Request,
  res: Response,
) => {
  try {
    const allGameRecords = await prisma.gameInformation.findMany({
      include: {
        user: true,
      },
    });

    if (!allGameRecords || allGameRecords.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No records found in game_information to process.",
        stats: {
          totalProcessed: 0,
          successfullyUpdated: 0,
          failedNetworkRequests: 0,
        },
      });
    }

    console.log(
      `[Batch Engine] Syncing achievements across ${allGameRecords.length} system database records...`,
    );

    let updatedCount = 0;
    let failedCount = 0;

    for (const record of allGameRecords) {
      const targetSteamId = record.user?.id;
      const targetAppId = record.steamAppid;

      if (!targetSteamId) {
        console.warn(
          `[Batch Engine] Record ID ${record.id} skipped: Connected UserProfile does not contain an id string.`,
        );
        continue;
      }

      let achievementsJson = { unlocked: 0, total: 0, percentage: 0 };
      let isSuccess = true;

      try {
        const steamResponse = await axios.get(
          `https://api.steampowered.com/ISteamUserStats/GetPlayerAchievements/v1/`,
          {
            params: {
              key: STEAM_API_KEY,
              steamid: targetSteamId,
              appid: targetAppId,
            },
            timeout: 5000,
          },
        );

        const playerstats = steamResponse.data?.playerstats;

        if (playerstats && Array.isArray(playerstats.achievements)) {
          const total = playerstats.achievements.length;
          const unlocked = playerstats.achievements.filter(
            (a: any) => a.achieved === 1,
          ).length;
          const percentage =
            total > 0 ? parseFloat(((unlocked / total) * 100).toFixed(2)) : 0;

          achievementsJson = { unlocked, total, percentage };
        }
      } catch (steamError: any) {
        if (steamError.response?.status === 400) {
          achievementsJson = { unlocked: 0, total: 0, percentage: 0 };
        } else {
          console.error(
            `[Batch Engine Error] Game ID ${targetAppId} for Steam ID ${targetSteamId}: ${steamError.message}`,
          );
          failedCount++;
          isSuccess = false;
        }
      }

      if (isSuccess) {
        await prisma.gameInformation.update({
          where: { id: record.id },
          data: {
            achievements: achievementsJson,
          },
        });
        updatedCount++;
      }

      await new Promise((resolve) => setTimeout(resolve, 150));
    }

    return res.status(200).json({
      success: true,
      message: "Global achievement records updated successfully.",
      stats: {
        totalProcessed: allGameRecords.length,
        successfullyUpdated: updatedCount,
        failedNetworkRequests: failedCount,
      },
    });
  } catch (error: any) {
    console.error("Critical sweep execution block error:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Internal batch compilation loop failure.",
    });
  }
};
