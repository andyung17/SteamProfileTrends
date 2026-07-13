import { Request, Response } from "express";

export const syncUserProfile = async (req: Request, res: Response) => {
  try {
    const { steamId } = req.body;

    if (!steamId) {
      return res.status(400).json({
        success: false,
        error: "Validation Failed: steamId is required in the request body.",
      });
    }

    console.log(
      `[userController] Received sync request for Steam ID: ${steamId}`,
    );

    return res.status(200).json({
      success: true,
      message: "Backend endpoint reached successfully!",
      receivedSteamId: steamId,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[userController] System error in baseline sync:", error);
    return res.status(500).json({
      success: false,
      error: "Internal Server Error",
    });
  }
};
