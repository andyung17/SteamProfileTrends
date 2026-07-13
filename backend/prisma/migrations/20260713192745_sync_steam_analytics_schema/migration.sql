-- CreateTable
CREATE TABLE "user_profiles" (
    "id" TEXT NOT NULL,
    "display_name" TEXT NOT NULL,
    "avatar_url" TEXT,
    "level" INTEGER NOT NULL,
    "join_date" TIMESTAMP(3) NOT NULL,
    "community_visibility" INTEGER NOT NULL,

    CONSTRAINT "user_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "games" (
    "steam_appid" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "genres" JSONB NOT NULL,
    "main_story" JSONB,
    "completionist" JSONB,
    "icon_url" TEXT NOT NULL,
    "logo_url" TEXT NOT NULL,

    CONSTRAINT "games_pkey" PRIMARY KEY ("steam_appid")
);

-- CreateTable
CREATE TABLE "game_information" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "steam_appid" INTEGER NOT NULL,
    "recent_hours_played" DOUBLE PRECISION NOT NULL,
    "total_hours_played" DOUBLE PRECISION NOT NULL,
    "achievements" JSONB NOT NULL,

    CONSTRAINT "game_information_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "game_id" TEXT NOT NULL,
    "start_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "end_at" TIMESTAMP(3),
    "total_duration" INTEGER,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "playtime_checks" (
    "id" TEXT NOT NULL,
    "session_id" TEXT,
    "game_id" INTEGER NOT NULL,
    "checked_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "cumulative_playtime" INTEGER NOT NULL,

    CONSTRAINT "playtime_checks_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "game_information" ADD CONSTRAINT "game_information_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "game_information" ADD CONSTRAINT "game_information_steam_appid_fkey" FOREIGN KEY ("steam_appid") REFERENCES "games"("steam_appid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_game_id_fkey" FOREIGN KEY ("game_id") REFERENCES "game_information"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "playtime_checks" ADD CONSTRAINT "playtime_checks_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "sessions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "playtime_checks" ADD CONSTRAINT "playtime_checks_game_id_fkey" FOREIGN KEY ("game_id") REFERENCES "games"("steam_appid") ON DELETE CASCADE ON UPDATE CASCADE;
