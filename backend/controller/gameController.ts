import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// searchGames
export const searchGames = async (req: Request, res: Response) => {
  try {
    const { q } = req.query;

    if (!q || typeof q !== "string") {
      return res.status(400).json({ error: "Search query 'q' is required." });
    }

    const games = await prisma.game.findMany({
      where: {
        name: {
          contains: q,
          mode: "insensitive",
        },
      },
      take: 5,
    });

    return res.status(200).json({
      success: true,
      count: games.length,
      games,
    });
  } catch (error) {
    console.error("Search failed:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

// getGameDetails
