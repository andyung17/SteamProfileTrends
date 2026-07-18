import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

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
