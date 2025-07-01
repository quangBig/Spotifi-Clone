import { Router } from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { addReaction, deleteMessage, getAllUsers, getMessages, removeReaction, updateMessage } from "../controller/user.controller.js";
const router = Router();

router.get("/", protectRoute, getAllUsers);
router.get("/messages/:userId", protectRoute, getMessages);
router.post("/messages/:messageId/reactions", protectRoute, addReaction);
router.delete("/messages/:messageId/reactions", protectRoute, removeReaction);

router.put("/messages/:messageId", protectRoute, updateMessage);
router.delete("/messages/:messageId", protectRoute, deleteMessage);

export default router;
