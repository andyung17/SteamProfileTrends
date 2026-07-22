import axios from "axios";
import { spawn } from "child_process";
import path from "path";

interface SteamStoreResult {
  success: boolean;
  genres: string[];
  logoUrl: string;
  iconUrl: string;
}

interface GamePlaytimes {
  mainStory: any;
  completionist: any;
}

export async function fetchSteamStoreDetails(
  appid: number,
): Promise<SteamStoreResult> {
  try {
    const storeUrl = `https://store.steampowered.com/api/appdetails?appids=${appid}`;
    const storeResponse = await axios.get(storeUrl);

    if (storeResponse.data[appid] && storeResponse.data[appid].success) {
      const gameData = storeResponse.data[appid].data;

      let genres: string[] = [];
      try {
        const spyUrl = `https://steamspy.com/api.php?request=appdetails&appid=${appid}`;
        const spyResponse = await axios.get(spyUrl);

        if (spyResponse.data && spyResponse.data.tags) {
          genres = Object.keys(spyResponse.data.tags);
        }
      } catch (spyError: any) {
        console.warn(
          `[Steam Spy] Failed fetching tags for app ${appid}, falling back to empty array.`,
          spyError.message,
        );
      }

      return {
        success: true,
        genres,
        logoUrl: gameData.header_image || "",
        iconUrl: gameData.capsule_image || "",
      };
    }
  } catch (error: any) {
    console.error(
      `Failed fetching storefront details for app ${appid}:`,
      error.message,
    );
  }

  return {
    success: false,
    genres: [],
    logoUrl: "",
    iconUrl: "",
  };
}

export function fetchGamePlaytimes(gameName: string): Promise<GamePlaytimes> {
  return new Promise((resolve) => {
    const scriptPath = path.resolve(process.cwd(), "hours_completed.py");

    const pythonProcess = spawn("python", [scriptPath, gameName]);

    let outputData = "";
    let errorData = "";

    pythonProcess.stdout.on("data", (data) => {
      outputData += data.toString();
    });

    pythonProcess.stderr.on("data", (data) => {
      errorData += data.toString();
    });

    pythonProcess.on("close", (code) => {
      if (code !== 0) {
        console.error(
          `[Python Helper] Script exited with code ${code}. Error: ${errorData}`,
        );
        return resolve({ mainStory: null, completionist: null });
      }

      try {
        const parsed = JSON.parse(outputData);
        resolve({
          mainStory: parsed.main_story ?? null,
          completionist: parsed.completionist ?? null,
        });
      } catch (parseError) {
        console.error(
          `[Python Helper] Failed to parse output for "${gameName}":`,
          parseError,
        );
        resolve({ mainStory: null, completionist: null });
      }
    });
  });
}

// Get session list (user)
//
