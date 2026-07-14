import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const syncUserProfile = async (req: Request, res: Response) => {
  try {
    const { steamId, displayName, avatarUrl, level } = req.body;

    if (!steamId) {
      return res.status(400).json({ error: "Steam ID required" });
    }

    const user = await prisma.userProfile.upsert({
      where: { id: steamId },
      update: {
        displayName: displayName,
        avatarUrl: avatarUrl,
        level: level,
      },
      create: {
        id: steamId,
        displayName: displayName || "New Player",
        avatarUrl: avatarUrl || "https://default-avatar...",
        communityVisibility: 3,
        joinDate: new Date(),
        level: level || 1,
      },
    });

    return res.status(200).json({
      success: true,
      message: "User successfully authenticated and synchronized.",
      user,
    });
  } catch (error) {
    console.error("Database sync failed:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
