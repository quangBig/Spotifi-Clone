import { Router } from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { addReaction, getAllUsers, getMessages, removeReaction } from "../controller/user.controller.js";
const router = Router();

router.get("/", protectRoute, getAllUsers);
router.get("/messages/:userId", protectRoute, getMessages);
router.post("/messages/:messageId/reactions", protectRoute, addReaction);
router.delete("/messages/:messageId/reactions", protectRoute, removeReaction);

export default router;
