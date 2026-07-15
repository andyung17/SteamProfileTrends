SELECT 
	g.steam_appid,
    g.name,
    gi.total_hours_played,
    g.main_story,
    g.completionist,
    s.total_duration,
	s.end_at
FROM 
    sessions s
INNER JOIN 
    game_information gi ON s.game_id = gi.id 
INNER JOIN 
    games g ON gi.steam_appid = g.steam_appid
ORDER BY
	end_at DESC;