interface UserProfile {
  id: string;
  display_name: string;
  avatar_url: string;
  level: number;
  join_date: Date;
}

export type { UserProfile };
