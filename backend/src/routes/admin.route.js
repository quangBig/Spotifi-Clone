import { Router } from "express";
import { checkAdmin, createAlbum, createSong, deleteAlbum, deleteSong, editAlbum, editSong } from "../controller/admin.controller.js";
import { protectRoute, requireAdmin } from "../middleware/auth.middleware.js";

const router = Router();

router.use(protectRoute, requireAdmin);

router.get("/check", checkAdmin);

router.post("/songs", createSong);
router.delete("/songs/:id", deleteSong);
router.put("/songs/:id",editSong)

router.post("/albums", createAlbum);
router.delete("/albums/:id", deleteAlbum);
router.put("/albums/:id", editAlbum);

export default router;
