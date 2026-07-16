import { Router } from "express";

import { syncUserProfile } from "../../controller/userController";
import { deleteUserProfile } from "../../controller/userController";

const router = Router();

router.post("/sync", syncUserProfile);
router.post("/:steamId", deleteUserProfile);

export default router;
