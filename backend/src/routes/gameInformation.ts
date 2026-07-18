import { Router } from "express";

import { getGameInformationDetails } from "../../controller/gameInfoController";
import { getTopGamesList } from "../../controller/gameInfoController";
import { syncAllAchievementsInDatabase } from "../../controller/gameInfoController";
import { getTopPlayedTags } from "../../controller/gameInfoController";

const router = Router({ mergeParams: true });

router.get("/users/:userId/game/:steamAppid", getGameInformationDetails);
router.get("/users/:userId/game/", getTopGamesList);
router.post("/syncAllAchievementsInDatabase", syncAllAchievementsInDatabase);
router.get("/users/:userId/tags", getTopPlayedTags);

export default router;
