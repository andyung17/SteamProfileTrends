interface Game {
  id: string;
  steam_appid: number;
  name: string;

  genres: string[];

  // Optional
  main_story: number | string | null;
  completionist: number | string | null;
}

export type { Game };
