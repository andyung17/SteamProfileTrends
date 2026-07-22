# SteamProfileTrends — Historical Playtime & Genre Recommendation Dashboard

## Overview
SteamTrends tracks a user's Steam playtime over time (Steam's API only exposes
current totals, not history), builds genre-weighted play patterns, and
recommends games based on those trends.

## Features
- Steam OAuth login
- Automated playtime tracking (polling every N minutes)
- Historical playtime storage (daily/weekly/monthly trends)
- Weighted genre analysis
- Game recommendations based on genre affinity

## Architecture
- **Auth:** Steam Web API (OpenID)
- **Data collection:** Cron job polling Steam API per user session
- **Storage:** PostgreSQL (time-series playtime records)
- **Analysis:** Genre-weighting engine (Python)
- **Frontend:** React dashboard (daily/weekly/monthly charts)

## Tech Stack
Python, Node.js, PostgreSQL, React, Steam Web API

## Setup
(fill in once built: env vars, API key setup, run instructions)

## Roadmap
- [x] Steam OAuth integration
- [x] Playtime polling service
- [ ] Genre-weighting algorithm
- [x] Dashboard charts
- [ ] Recommendation engine
- [ ] Integration Testing
- [ ] Deployment
