interface PlaytimeCheck {
  id: string;
  session_id: string;
  checked_at: Date;
  cumulative_playtime: number;
}

export type { PlaytimeCheck };
