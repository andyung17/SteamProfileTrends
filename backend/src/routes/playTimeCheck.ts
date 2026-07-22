import { Router } from "express";

import { getPlaytimeChecksByUser } from "../../controller/playTimeCheckcontroller";

const router = Router({ mergeParams: true });

router.get("/playTimeCheck/:steamId", getPlaytimeChecksByUser);

export default router;
