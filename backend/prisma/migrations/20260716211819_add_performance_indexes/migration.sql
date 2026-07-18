/*
  Warnings:

  - A unique constraint covering the columns `[user_id,steam_appid]` on the table `game_information` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE INDEX "game_information_user_id_idx" ON "game_information"("user_id");

-- CreateIndex
CREATE INDEX "game_information_steam_appid_idx" ON "game_information"("steam_appid");

-- CreateIndex
CREATE UNIQUE INDEX "game_information_user_id_steam_appid_key" ON "game_information"("user_id", "steam_appid");

-- CreateIndex
CREATE INDEX "playtime_checks_session_id_idx" ON "playtime_checks"("session_id");

-- CreateIndex
CREATE INDEX "playtime_checks_game_id_idx" ON "playtime_checks"("game_id");

-- CreateIndex
CREATE INDEX "playtime_checks_checked_at_idx" ON "playtime_checks"("checked_at");

-- CreateIndex
CREATE INDEX "sessions_user_id_idx" ON "sessions"("user_id");

-- CreateIndex
CREATE INDEX "sessions_game_id_idx" ON "sessions"("game_id");

-- CreateIndex
CREATE INDEX "sessions_start_at_idx" ON "sessions"("start_at");
