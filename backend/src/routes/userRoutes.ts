import { Router } from "express";

import { syncUserProfile } from "../../controller/userController";

const router = Router();

router.post("/sync", syncUserProfile);

export default router;
