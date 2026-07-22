import { Router } from "express";

import { getGameDetails } from "../../controller/gameController";

const router = Router({ mergeParams: true });

router.get("/game/:steamAppid", getGameDetails);

export default router;
