interface GameInformation {
  id: string;
  user_id: string;
  steam_appid: number;
  name: string;
  recent_hoursPlayed: number; // 2-week playtime
  total_hoursPlayed: number; // total playtime
  icon_url: string;
  achievements: {
    unlocked: number;
    total: number;
    percentage: number;
  };
  genres: string[];

  // Optional
  main_story: number | string | null;
  completionist: number | string | null;
}

export type { GameInformation };
