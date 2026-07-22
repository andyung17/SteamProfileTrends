import "dotenv/config";
import express from "express";
import axios from "axios";
import cors from "cors";
import passport from "passport";
import { Strategy as SteamStrategy } from "passport-steam";
import { PrismaClient } from "@prisma/client";
import { spawn } from "child_process";

import userRouter from "./src/routes/userRoutes.ts";
import sessionRouter from "./src/routes/sessionRoutes.ts";
import gameInfoRouter from "./src/routes/gameInformation.ts";
import gameRouter from "./src/routes/gameRoutes.ts";
import playTimeRouter from "./src/routes/playTimeCheck.ts";

import { initPlaytimeCron } from "./src/services/cronService.ts";
import { fetchSteamStoreDetails } from "./src/utils/steam.ts";
import { fetchGamePlaytimes } from "./src/utils/steam.ts";

const STEAM_API_KEY = process.env.STEAM_API_KEY;
const prisma = new PrismaClient();
const app = express();
app.use(cors());
app.use(passport.initialize());

app.use("/api/users", userRouter);
app.use("/api", sessionRouter);
app.use("/api", gameInfoRouter);
app.use("/api", gameRouter);
app.use("/api", playTimeRouter);

passport.use(
  new SteamStrategy(
    {
      returnURL: "http://localhost:3000/api/auth/steam/return",
      realm: "http://localhost:3000/",
      apiKey: process.env.STEAM_API_KEY,
    },
    (identifier, profile, done) => {
      profile.steamid = identifier;
      return done(null, profile);
    },
  ),
);

app.get(
  "/api/auth/steam",
  passport.authenticate("steam", { failureRedirect: "/" }),
);

app.get(
  "/api/auth/steam/return",
  passport.authenticate("steam", { session: false, failureRedirect: "/" }),
  async (req, res) => {
    try {
      const steamId = req.user?.id;

      if (!steamId) {
        return res.redirect("http://localhost:5173/?error=auth_failed");
      }

      const displayName = req.user?.displayName || "Steam Player";
      const avatarUrl =
        req.user?.photos?.[2]?.value || "https://default-avatar...";

      const levelResponse = await axios.get(
        "https://api.steampowered.com/IPlayerService/GetSteamLevel/v1/",
        {
          params: { key: STEAM_API_KEY, steamid: steamId },
        },
      );

      await prisma.userProfile.upsert({
        where: { id: steamId },
        update: {
          displayName: displayName,
          avatarUrl: avatarUrl,
          level: levelResponse.data.response.player_level || 1,
        },
        create: {
          id: steamId,
          displayName: displayName,
          avatarUrl: avatarUrl,
          communityVisibility: 3,
          joinDate: new Date(),
          level: levelResponse.data.response.player_level || 1,
        },
      });

      console.log(`[Auth] Successfully synced Steam User ${steamId} to DB!`);

      res.redirect(`http://localhost:5173/homepage/user/${steamId}`);
    } catch (dbError) {
      console.error(
        "[Auth] Failed to write authenticated user to database:",
        dbError,
      );
      res.redirect("http://localhost:5173/?error=database_sync_failed");
    }
  },
);

app.post("/api/users/add/:steamId", async (req, res) => {
  const { steamId } = req.params;

  try {
    const profileResponse = await axios.get(
      "https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/",
      {
        params: {
          key: STEAM_API_KEY,
          steamids: steamId,
        },
      },
    );

    const playerData = profileResponse.data?.response?.players?.[0];

    if (!playerData) {
      return res.status(404).json({ error: "Steam user not found." });
    }

    const displayName = playerData.personaname || "Steam Player";
    const avatarUrl = playerData.avatarfull || "https://default-avatar...";
    const communityVisibility = playerData.communityvisibilitystate || 3;

    let steamLevel = 1;
    try {
      const levelResponse = await axios.get(
        "https://api.steampowered.com/IPlayerService/GetSteamLevel/v1/",
        {
          params: { key: STEAM_API_KEY, steamid: steamId },
        },
      );
      steamLevel = levelResponse.data?.response?.player_level || 1;
    } catch (levelErr) {
      console.warn(
        `[API] Could not fetch level for ${steamId}, defaulting to 1`,
      );
    }

    const newUser = await prisma.userProfile.create({
      data: {
        id: steamId,
        displayName: displayName,
        avatarUrl: avatarUrl,
        communityVisibility: communityVisibility,
        joinDate: new Date(),
        level: steamLevel,
      },
    });

    return res.status(201).json({
      success: true,
      message: "User registered successfully!",
      user: newUser,
    });
  } catch (error) {
    if (error.code === "P2002") {
      return res
        .status(409)
        .json({ error: "User already exists in database." });
    }

    console.error("[Manual Add Error] Failed to register user:", error.message);
    return res.status(500).json({ error: "Failed to add manual Steam user" });
  }
});

app.get("/api/profile/:steamid", async (req, res) => {
  const { steamid } = req.params;
  console.log("Steamid received:", steamid);

  try {
    const [summaryRes, levelRes] = await Promise.all([
      axios.get(
        "https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/",
        {
          params: { key: process.env.STEAM_API_KEY, steamids: steamid },
        },
      ),
      axios.get(
        "https://api.steampowered.com/IPlayerService/GetSteamLevel/v1/",
        {
          params: { key: process.env.STEAM_API_KEY, steamid: steamid },
        },
      ),
    ]);

    const player = summaryRes.data.response.players[0];
    const level = levelRes.data.response.player_level;

    res.json({
      avatarFull: player.avatarfull,
      playerName: player.personaname,
      level: level,
    });
  } catch (err) {
    console.error("Steam API error:", err.response?.status, err.response?.data);
    res.status(500).json({ error: "Failed to fetch Steam data" });
  }
});

app.get("/api/recent-games/:steamid", async (req, res) => {
  const { steamid } = req.params;

  try {
    const { data } = await axios.get(
      "https://api.steampowered.com/IPlayerService/GetRecentlyPlayedGames/v1/",
      { params: { key: process.env.STEAM_API_KEY, steamid, count: 5 } },
    );

    const games = (data.response.games || []).map((game) => ({
      appid: game.appid,
      name: game.name,
      recent_hoursPlayed: Math.round((game.playtime_2weeks / 60) * 10) / 10,
      total_hoursPlayed: Math.round((game.playtime_forever / 60) * 10) / 10,
      icon_url: `https://cdn.akamai.steamstatic.com/steam/apps/${game.appid}/header.jpg`,
    }));

    res.json({ games });
  } catch (err) {
    console.error("Steam API error:", err.response?.status, err.response?.data);
    res.status(500).json({ error: "Failed to fetch recent games" });
  }
});

app.get("/api/game-details/:name", async (req, res) => {
  const gameName = req.params.name;

  try {
    const playtimes = await fetchGamePlaytimes(gameName);

    return res.json(playtimes);
  } catch (error) {
    console.error(`Error fetching details for ${gameName}:`, error);
    return res.status(500).json({ error: "Failed to fetch game playtimes" });
  }
});

app.get("/api/game-achievements/:appid", async (req, res) => {
  const { appid } = req.params;
  const { steamId } = req.query;
  const apiKey = process.env.STEAM_API_KEY;

  if (!apiKey) {
    return res
      .status(500)
      .json({ error: "Steam API key is missing on the server" });
  }
  console.log(`Fetching achievements for app ${appid} and steamId ${steamId}`);

  try {
    const url = `https://api.steampowered.com/ISteamUserStats/GetPlayerAchievements/v0001/?key=${apiKey}&steamid=${steamId}&appid=${appid}`;
    const response = await axios.get(url);

    if (response.data.playerstats && response.data.playerstats.achievements) {
      const achievements = response.data.playerstats.achievements;

      const total = achievements.length;

      const unlocked = achievements.filter((ach) => ach.achieved === 1).length;

      const percentage = total > 0 ? Math.round((unlocked / total) * 100) : 0;

      res.json({
        success: true,
        gameName: response.data.playerstats.gameName,
        unlockedCount: unlocked,
        totalCount: total,
        percentage: percentage,
      });
    } else {
      // Game exists but has 0 achievements (e.g., some indie titles or visual novels)
      res.json({
        success: true,
        unlockedCount: 0,
        totalCount: 0,
        percentage: 0,
      });
    }
  } catch (error) {
    console.error(
      `Error fetching achievements for app ${appid}:`,
      error.message,
    );

    res.status(200).json({
      success: false,
      unlockedCount: 0,
      totalCount: 0,
      percentage: 0,
      error: "Achievements hidden or unavailable",
    });
  }
});

app.get("/api/game-genres/:appid", async (req, res) => {
  const { appid } = req.params;

  const result = await fetchSteamStoreDetails(Number(appid));

  if (result.success) {
    // Keeps the exact output your frontend expects!
    return res.json({ success: true, genres: result.genres });
  } else {
    // If it failed or was rate-limited, keep your original fallback behavior intact
    return res.json({
      success: false,
      genres: [],
      error: "Rate limited or store error",
    });
  }
});

app.listen(3000, () => {
  console.log("Proxy running on port 3000");

  initPlaytimeCron();
});
