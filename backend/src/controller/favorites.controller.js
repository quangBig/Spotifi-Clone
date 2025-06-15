import { Favorite } from "../models/favorites.model.js";
import { Song } from "../models/song.model.js";
import { Album } from "../models/album.model.js";

// GET /favorites/:userId
export const getFavoritesByUser = async (req, res) => {
    try {
        const { userId } = req.params;
        console.log('Fetching favorites for user:', userId);

        const favorites = await Favorite.find({ userId })
            .populate({
                path: 'itemId',
                select: 'title artist imageUrl duration createdAt',
                refPath: 'itemType'
            });

        console.log('Found favorites:', favorites);

        // Transform the data to match the frontend expectations
        const transformedFavorites = favorites.map(fav => {
            if (!fav.itemId) {
                console.log('Warning: itemId is null for favorite:', fav);
                return null;
            }
            return {
                ...fav.toObject(),
                item: fav.itemId // Rename itemId to item for frontend
            };
        }).filter(Boolean); // Remove any null entries

        res.json({ data: transformedFavorites });
    } catch (error) {
        console.error('Error fetching favorites:', error);
        res.status(500).json({
            message: "Không thể lấy danh sách yêu thích",
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};

// POST /favorites
export const addFavorite = async (req, res) => {
    try {
        const { userId, itemId, itemType } = req.body;
        console.log('Yêu cầu thêm yêu thích:', { userId, itemId, itemType });

        // Kiểm tra loại item
        if (!['Song', 'Album'].includes(itemType)) {
            return res.status(400).json({
                message: "Loại item không hợp lệ. Phải là 'Song' hoặc 'Album'",
                receivedType: itemType
            });
        }

        // Kiểm tra item đã tồn tại trong danh sách yêu thích chưa
        const existing = await Favorite.findOne({ userId, itemId, itemType });
        if (existing) {
            return res.status(400).json({ success: false });
        }

        const favorite = await Favorite.create({ userId, itemId, itemType });
        res.status(201).json({ data: favorite });
    } catch (error) {
        console.error('Lỗi khi thêm yêu thích:', error);
        res.status(500).json({ message: "Không thể thêm vào danh sách yêu thích", error });
    }
};

// DELETE /favorites
export const removeFavorite = async (req, res) => {
    try {
        const { userId, itemId, itemType } = req.body;
        const result = await Favorite.findOneAndDelete({ userId, itemId, itemType });

        if (!result) {
            return res.status(404).json({ message: "Không tìm thấy item trong danh sách yêu thích" });
        }

        res.json({ message: "Đã xóa khỏi danh sách yêu thích" });
    } catch (error) {
        res.status(500).json({ message: "Không thể xóa khỏi danh sách yêu thích", error });
    }
};
