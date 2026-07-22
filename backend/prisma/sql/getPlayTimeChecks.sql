SELECT 
	u.display_name,
    g.name,
    q.cumulative_playtime,
	s.end_at
FROM 
    sessions s
INNER JOIN 
    game_information gi ON s.game_id = gi.id 
INNER JOIN 
    games g ON gi.steam_appid = g.steam_appid
INNER JOIN
	user_profiles u ON s.user_id = u.id
INNER JOIN
	playtime_checks q ON s.id = q.session_id
ORDER BY
	end_at DESC;