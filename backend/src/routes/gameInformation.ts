import { Router } from "express";

import { getGameInformationDetails } from "../../controller/gameInfoController";
import { getTopGamesList } from "../../controller/gameInfoController";

const router = Router({ mergeParams: true });

router.get("/users/:userId/game/:steamAppid", getGameInformationDetails);
router.get("/users/:userId/game/", getTopGamesList);

export default router;
