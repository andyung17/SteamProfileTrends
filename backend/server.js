import "dotenv/config";
import express from "express";
import axios from "axios";
import cors from "cors";

const app = express();
app.use(cors());

const STEAM_API_KEY = process.env.STEAM_API_KEY;

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
      { params: { key: process.env.STEAM_API_KEY, steamid, count: 6 } },
    );

    const games = (data.response.games || []).map((game) => ({
      appid: game.appid,
      name: game.name,
      hoursPlayed: Math.round((game.playtime_2weeks / 60) * 10) / 10,
      iconUrl: `https://cdn.akamai.steamstatic.com/steam/apps/${game.appid}/header.jpg`,
    }));

    res.json({ games });
  } catch (err) {
    console.error("Steam API error:", err.response?.status, err.response?.data);
    res.status(500).json({ error: "Failed to fetch recent games" });
  }
});

app.listen(3000, () => console.log("Proxy running on port 3000"));
