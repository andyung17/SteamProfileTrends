import { Router } from "express";

import { getSessionAmount } from "../../controller/sessionController";
import { getSessionHistory } from "../../controller/sessionController";
import { getOneTypeSessionHistory } from "../../controller/sessionController";

const router = Router({ mergeParams: true });

router.get("/users/:steamId/session/:gameId", getSessionAmount);
router.get("/user/sessionhistory/:steamId", getSessionHistory);
router.get(
  "/user/:steamId/singlesessionhistory/:gameId",
  getOneTypeSessionHistory,
);

export default router;
