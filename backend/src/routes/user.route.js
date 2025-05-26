import { Router } from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { getAllUsers, getMessages, postFavorites, deleteFavorites, getUserFavorites } from "../controller/user.controller.js";
const router = Router();

router.get("/", protectRoute, getAllUsers);
router.get("/messages/:userId", protectRoute, getMessages);
router.post("/favorites", protectRoute, postFavorites);
router.delete("/favorites/:id", deleteFavorites);
router.get("/favorites", protectRoute, getUserFavorites);

export default router;
