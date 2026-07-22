import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// # of session for a game by a user
// getSessionAmount
export const getSessionAmount = async (req: Request, res: Response) => {
  try {
    const { steamId, gameId } = req.params;

    if (!steamId) {
      return res
        .status(400)
        .json({ error: "Steam ID is required to find amount of sessions." });
    }
    if (!gameId) {
      return res
        .status(400)
        .json({ error: "Game Id is required to find amount of sessions" });
    }

    const resolvedGameId = Array.isArray(gameId)
      ? gameId[0]
      : (gameId as string);

    const sessionCount = await prisma.session.count({
      where: {
        userId: steamId as string,
        gameInstance: {
          steamAppid: parseInt(resolvedGameId, 10),
        },
      },
    });

    if (!sessionCount) {
      return res
        .status(404)
        .json({ success: false, error: "Could not compute session amount." });
    }

    return res.status(200).json({
      success: true,
      count: sessionCount,
    });
  } catch (error: any) {
    console.error("User retrieval error:", error);
    return res
      .status(500)
      .json({ success: false, error: "Internal Server Error" });
  }
};

// session history
export const getSessionHistory = async (req: Request, res: Response) => {
  try {
    const { steamId } = req.params;

    if (!steamId) {
      return res
        .status(400)
        .json({ error: "Steam ID is required to find amount of sessions." });
    }

    const sessionHistory = await prisma.session.findMany({
      where: {
        userId: steamId as string,
      },
      orderBy: {
        startAt: "desc",
      },
      include: {
        gameInstance: {
          select: {
            totalHoursPlayed: true,
            gameCatalog: {
              select: {
                name: true,
                steamAppid: true,
                mainStory: true,
                completionist: true,
                logoUrl: true,
                iconUrl: true,
              },
            },
          },
        },
      },
    });

    if (!sessionHistory) {
      return res
        .status(404)
        .json({ success: false, error: "No session history" });
    }

    return res.status(200).json({
      success: true,
      history: sessionHistory, // []
    });
  } catch (error: any) {
    console.error("Session history retrieval error:", error);
    return res
      .status(500)
      .json({ success: false, error: "Internal Server Error" });
  }
};

//
export const getOneTypeSessionHistory = async (req: Request, res: Response) => {
  try {
    const { steamId, gameId } = req.params;

    if (!steamId) {
      return res
        .status(400)
        .json({ error: "Steam ID is required to find amount of sessions." });
    }

    const parsedGameId = Number(gameId);
    if (isNaN(parsedGameId)) {
      return res
        .status(400)
        .json({ success: false, error: "Invalid Game ID format provided." });
    }

    const sessionHistory = await prisma.session.findMany({
      where: {
        userId: steamId as string,
        gameInstance: {
          steamAppid: parsedGameId,
        },
      },
      orderBy: {
        startAt: "desc",
      },
      include: {
        gameInstance: {
          select: {
            totalHoursPlayed: true,
            gameCatalog: {
              select: {
                name: true,
                steamAppid: true,
                mainStory: true,
                completionist: true,
                logoUrl: true,
                iconUrl: true,
              },
            },
          },
        },
      },
    });

    if (sessionHistory.length === 0) {
      return res.status(404).json({
        success: false,
        error: "No session history found for this game.",
      });
    }

    return res.status(200).json({
      success: true,
      history: sessionHistory,
    });
  } catch (error: any) {
    console.error("Session history retrieval error:", error);
    return res
      .status(500)
      .json({ success: false, error: "Internal Server Error" });
  }
};

export const getActiveSession = async (req: Request, res: Response) => {
  try {
    const { steamId } = req.params;

    if (!steamId) {
      return res.status(400).json({
        success: false,
        error: "Steam ID is required to query active session.",
      });
    }

    const activeSession = await prisma.session.findFirst({
      where: {
        userId: steamId as string,
        endAt: null,
      },
      include: {
        gameInstance: {
          select: {
            steamAppid: true,
            gameCatalog: {
              select: {
                name: true,
                iconUrl: true,
              },
            },
          },
        },
      },
      orderBy: {
        startAt: "desc",
      },
    });

    if (!activeSession) {
      return res.status(200).json({
        success: true,
        activeSession: null,
      });
    }

    return res.status(200).json({
      success: true,
      activeSession: {
        sessionId: activeSession.id,
        gameId: activeSession.gameInstance.steamAppid,
        gameName: activeSession.gameInstance.gameCatalog.name,
        startAt: activeSession.startAt,
        logoUrl: activeSession.gameInstance.gameCatalog.iconUrl,
      },
    });
  } catch (error: any) {
    console.error("Active session retrieval error:", error);
    return res.status(500).json({
      success: false,
      error: "Internal Server Error",
    });
  }
};

// # of users played this game out of total
