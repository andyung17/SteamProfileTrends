interface Sessions {
  id: string;
  user_id: string;
  game_id: string;
  start_at: Date;
  end_at: Date | null;
  total_duration: number | null;
}

export type { Sessions };
