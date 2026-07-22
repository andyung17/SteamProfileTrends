import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const formatSessionTimeRange = (startAt?: Date | null, endAt?: Date | null) => {
  if (!startAt) return null;

  const startDate = new Date(startAt);
  const formatTime = (d: Date) => {
    let hours = d.getHours();
    const minutes = d.getMinutes();
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    const minutesStr = minutes < 10 ? `0${minutes}` : minutes;
    return `${hours}:${minutesStr} ${ampm}`;
  };

  const startStr = formatTime(startDate);

  let endStr = "";
  if (endAt) {
    endStr = ` - ${formatTime(new Date(endAt))}`;
  }

  const hour = startDate.getHours();
  let timeCategory = "";
  if (hour >= 6 && hour < 12) {
    timeCategory = "Morning";
  } else if (hour >= 12 && hour < 17) {
    timeCategory = "Afternoon";
  } else if (hour >= 17 && hour < 22) {
    timeCategory = "Evening";
  } else {
    timeCategory = "Night";
  }

  return `(${startStr}${endStr}, ${timeCategory})`;
};

// Default is 30-day activity lookup
export const getPlaytimeChecksByUser = async (req: Request, res: Response) => {
  try {
    const steamId = req.params.steamId as string;

    if (!steamId) {
      return res.status(400).json({
        success: false,
        error: "Steam User ID is required.",
      });
    }

    let daysToLookBack = 30;

    if (req.query.days) {
      const parsedDays = Number(req.query.days);

      if (isNaN(parsedDays) || parsedDays <= 0) {
        return res.status(400).json({
          success: false,
          error: "Query parameter 'days' must be a positive number.",
        });
      }

      daysToLookBack = parsedDays;
    }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysToLookBack);

    const playtimeChecks = await prisma.playtimeCheck.findMany({
      where: {
        checkedAt: {
          gte: startDate,
        },
        gameCatalog: {
          gameInstances: {
            some: {
              userId: steamId,
            },
          },
        },
      },
      orderBy: {
        checkedAt: "desc",
      },
      include: {
        gameCatalog: {
          select: {
            steamAppid: true,
            name: true,
            genres: true,
            logoUrl: true,
          },
        },
        session: {
          select: {
            id: true,
            userId: true,
            startAt: true,
            endAt: true,
            totalDuration: true,
          },
        },
      },
    });

    const formattedChecks = playtimeChecks.map((check) => ({
      ...check,
      session: check.session
        ? {
            id: check.session.id,
            userId: check.session.userId,
            startAt: check.session.startAt,
            endAt: check.session.endAt,
            totalDuration: check.session.totalDuration,
            isOngoing: check.session.endAt === null,
          }
        : null,
    }));

    // for calender
    const activityMap: Record<
      string,
      Array<{
        gameId: string;
        gameName: string;
        logoUrl: string;
        durationMinutes: number;
        timeRangeString: string | null;
        sessionId?: string;
        startAt?: Date | null;
        endAt?: Date | null;
      }>
    > = {};

    const today = new Date();
    for (let i = 0; i < daysToLookBack; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const dayNum = String(d.getDate()).padStart(2, "0");
      const dateKey = `${year}-${month}-${dayNum}`;

      activityMap[dateKey] = [];
    }

    const uniqueSessionsMap = new Map<string, (typeof formattedChecks)[0]>();

    formattedChecks.forEach((check) => {
      const sessionId = check.session?.id
        ? String(check.session.id)
        : `check-${check.id}`;

      if (
        !uniqueSessionsMap.has(sessionId) ||
        (check.session?.totalDuration || 0) >
          (uniqueSessionsMap.get(sessionId)?.session?.totalDuration || 0)
      ) {
        uniqueSessionsMap.set(sessionId, check);
      }
    });

    const gamePlaytimeMap: Record<string, { hours: number; genres: string[] }> =
      {};

    uniqueSessionsMap.forEach((check) => {
      const gameName = check.gameCatalog?.name;
      if (!gameName) return;

      const genres = (check.gameCatalog?.genres as string[]) || [];
      const sessionDurationHours = (check.session?.totalDuration || 0) / 60;

      if (!gamePlaytimeMap[gameName]) {
        gamePlaytimeMap[gameName] = {
          hours: 0,
          genres: genres,
        };
      }

      gamePlaytimeMap[gameName].hours += sessionDurationHours;
    });

    const dailyAggregator: Record<
      string,
      Record<
        string,
        {
          gameId: string;
          gameName: string;
          logoUrl: string;
          totalMinutes: number;
          sessionId?: string;
          startAt?: Date | null;
          endAt?: Date | null;
        }
      >
    > = {};

    uniqueSessionsMap.forEach((check) => {
      const sessionStart = check.session?.startAt;
      const targetDate = sessionStart
        ? new Date(sessionStart)
        : check.checkedAt
          ? new Date(check.checkedAt)
          : null;
      if (!targetDate) return;

      const year = targetDate.getFullYear();
      const month = String(targetDate.getMonth() + 1).padStart(2, "0");
      const dayNum = String(targetDate.getDate()).padStart(2, "0");
      const dateKey = `${year}-${month}-${dayNum}`;

      if (activityMap[dateKey]) {
        const gameName = check.gameCatalog!.name;
        const gameAppId = check.gameCatalog?.steamAppid;
        const gameId = String(gameAppId || gameName);
        const logoUrl = check.gameCatalog?.logoUrl || "";
        const durationMinutes = check.session?.totalDuration || 0;

        if (!dailyAggregator[dateKey]) {
          dailyAggregator[dateKey] = {};
        }

        if (!dailyAggregator[dateKey][gameId]) {
          dailyAggregator[dateKey][gameId] = {
            gameId,
            gameName,
            logoUrl,
            totalMinutes: 0,
            sessionId: check.session?.id,
            startAt: check.session?.startAt,
            endAt: check.session?.endAt,
          };
        }

        if (durationMinutes > dailyAggregator[dateKey][gameId].totalMinutes) {
          dailyAggregator[dateKey][gameId].totalMinutes = durationMinutes;
          dailyAggregator[dateKey][gameId].sessionId = check.session?.id;
          dailyAggregator[dateKey][gameId].startAt = check.session?.startAt;
          dailyAggregator[dateKey][gameId].endAt = check.session?.endAt;
        }
      }
    });

    Object.entries(dailyAggregator).forEach(([dateKey, gamesObj]) => {
      if (activityMap[dateKey]) {
        activityMap[dateKey] = Object.values(gamesObj).map((g) => ({
          gameId: g.gameId,
          gameName: g.gameName,
          logoUrl: g.logoUrl,
          durationMinutes: g.totalMinutes > 0 ? g.totalMinutes : 30,
          timeRangeString: formatSessionTimeRange(g.startAt, g.endAt),
          sessionId: g.sessionId,
          startAt: g.startAt,
          endAt: g.endAt,
        }));
      }
    });

    const genreTotals: Record<string, number> = {};

    Object.values(gamePlaytimeMap).forEach(({ hours, genres }) => {
      genres.forEach((genre: string) => {
        genreTotals[genre] = (genreTotals[genre] || 0) + hours;
      });
    });

    const sortedGenres = Object.entries(genreTotals)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 6);

    const radarChartData = {
      labels: sortedGenres.map(([genre]) => genre),
      series: sortedGenres.map(([, hours]) => Number(hours.toFixed(2))),
    };

    let grandTotalHours = 0;
    const gameTotalsArray: [string, number][] = [];

    Object.entries(gamePlaytimeMap).forEach(([gameName, { hours }]) => {
      gameTotalsArray.push([gameName, hours]);
      grandTotalHours += hours;
    });

    gameTotalsArray.sort(([, a], [, b]) => b - a);

    const top5Games = gameTotalsArray.slice(0, 5);
    const otherGames = gameTotalsArray.slice(5);
    const otherHours = otherGames.reduce((acc, [, hours]) => acc + hours, 0);

    const gameLabels: string[] = [];
    const gamePercentages: number[] = [];
    const gameRawHours: number[] = [];

    const truncateName = (name: string, maxLen = 18) =>
      name.length > maxLen ? name.substring(0, maxLen) + "..." : name;

    if (grandTotalHours > 0) {
      top5Games.forEach(([name, hours]) => {
        const pct = (hours / grandTotalHours) * 100;
        gameLabels.push(truncateName(name));
        gamePercentages.push(Number(pct.toFixed(2)));
        gameRawHours.push(Number(hours.toFixed(2)));
      });

      if (otherHours > 0) {
        const otherPct = (otherHours / grandTotalHours) * 100;
        gameLabels.push("Other");
        gamePercentages.push(Number(otherPct.toFixed(2)));
        gameRawHours.push(Number(otherHours.toFixed(2)));
      }
    }

    const topGamesChartData = {
      labels: gameLabels,
      seriesPercentages: gamePercentages,
      seriesHours: gameRawHours,
      totalHours: Number(grandTotalHours.toFixed(2)),
    };

    let longestSessionMinutes = 0;
    let longestSessionGame = "None";
    let totalLaunchesCount = uniqueSessionsMap.size;
    let sumDurations = 0;

    uniqueSessionsMap.forEach((check) => {
      const mins = check.session?.totalDuration || 0;
      sumDurations += mins;
      if (mins > longestSessionMinutes) {
        longestSessionMinutes = mins;
        longestSessionGame = check.gameCatalog?.name || "Unknown Game";
      }
    });

    const avgSessionMinutes =
      totalLaunchesCount > 0
        ? Math.round(sumDurations / totalLaunchesCount)
        : 0;

    const activeDatesSet = new Set<string>();
    uniqueSessionsMap.forEach((check) => {
      const sessionStart = check.session?.startAt;
      const timestamp = sessionStart ? new Date(sessionStart) : check.checkedAt;
      if (timestamp) {
        const d = new Date(timestamp);
        const dateKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
        activeDatesSet.add(dateKey);
      }
    });

    let currentStreak = 0;
    let maxStreak = 0;

    for (let i = 0; i < daysToLookBack; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

      if (activeDatesSet.has(dateKey)) {
        currentStreak++;
        if (currentStreak > maxStreak) {
          maxStreak = currentStreak;
        }
      } else {
        currentStreak = 0;
      }
    }

    const sessionStats = {
      longestSession: {
        gameName: longestSessionGame,
        minutes: longestSessionMinutes,
      },
      avgSessionMinutes,
      totalLaunches: totalLaunchesCount,
      currentStreak: maxStreak,
      weeklyPercentChange: 12,
    };

    const peakHoursSeries = [0, 0, 0, 0];

    uniqueSessionsMap.forEach((check) => {
      const sessionStart = check.session?.startAt;
      const checkTimestamp = sessionStart
        ? new Date(sessionStart)
        : check.checkedAt;
      if (!checkTimestamp) return;

      const hour = new Date(checkTimestamp).getHours();
      const hoursVal = (check.session?.totalDuration || 0) / 60;

      if (hour >= 6 && hour < 12) {
        peakHoursSeries[0] += hoursVal;
      } else if (hour >= 12 && hour < 17) {
        peakHoursSeries[1] += hoursVal;
      } else if (hour >= 17 && hour < 22) {
        peakHoursSeries[2] += hoursVal;
      } else {
        peakHoursSeries[3] += hoursVal;
      }
    });

    const formattedPeakHours = peakHoursSeries.map((val) =>
      Number(val.toFixed(1)),
    );

    return res.status(200).json({
      success: true,
      daysRequested: daysToLookBack,
      count: formattedChecks.length,
      radarChartData,
      topGamesChartData,
      peakHoursSeries: formattedPeakHours,
      sessionStats,
      activityMap,
    });
  } catch (error: any) {
    console.error("Failed to retrieve playtime checks for user:", error);
    return res.status(500).json({
      success: false,
      error: "Internal Server Error",
    });
  }
};
