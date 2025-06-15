import { Router } from "express";
import {
    getFavoritesByUser,
    addFavorite,
    removeFavorite,
} from "../controller/favorites.controller.js";

const router = Router();

// Lấy danh sách các mục yêu thích của một user
router.get("/:userId", getFavoritesByUser);

// Thêm một mục vào danh sách yêu thích
router.post("/", addFavorite);

// Xóa một mục khỏi danh sách yêu thích
router.delete("/", removeFavorite);

export default router;
