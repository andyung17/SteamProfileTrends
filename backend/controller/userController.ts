import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// creating user
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

// getUserDetails
export const getUserProfile = async (req: Request, res: Response) => {
  try {
    const steamId = req.params.steamId as string;

    if (!steamId) {
      return res
        .status(400)
        .json({ error: "Steam ID is required to find a profile." });
    }

    const steamUser = await prisma.userProfile.findUnique({
      where: { id: steamId },
    });

    if (!steamUser) {
      return res
        .status(404)
        .json({ success: false, error: "User profile not found." });
    }

    return res.status(200).json({
      success: true,
      steamUser,
    });
  } catch (error: any) {
    console.error("User retrieval error:", error);
    return res
      .status(500)
      .json({ success: false, error: "Internal Server Error" });
  }
};

// deleting a user
export const deleteUserProfile = async (req: Request, res: Response) => {
  try {
    const steamId = req.params.steamId as string;

    if (!steamId) {
      return res
        .status(400)
        .json({ error: "Steam ID is required to delete a profile." });
    }

    const deletedUser = await prisma.userProfile.delete({
      where: { id: steamId },
    });

    return res.status(200).json({
      success: true,
      message:
        "User profile and all associated play data have been permanently deleted.",
      deletedUserId: deletedUser.id,
    });
  } catch (error: any) {
    if (error.code === "P2025") {
      return res.status(404).json({ error: "User profile not found." });
    }

    console.error("Database deletion failed:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
