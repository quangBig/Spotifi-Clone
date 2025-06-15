import { create } from "zustand";
import { Song, Album } from "@/types";
import { axiosInstance } from "@/lib/axios";

interface FavoriteItem {
    _id: string;
    userId: string;
    itemType: "Song" | "Album";
    itemId: string;
    item: Song | Album;
    createdAt: string;
    updatedAt: string;
}

interface FavoritesStore {
    favorites: FavoriteItem[];
    isLoading: boolean;
    error: string | null;

    fetchFavorites: (userId: string) => Promise<void>;
    addFavorite: (userId: string, itemId: string, itemType: "Song" | "Album") => Promise<void>;
    removeFavorite: (userId: string, itemId: string, itemType: "Song" | "Album") => Promise<void>;
    clearFavorites: () => void;
}

export const useFavoritesStore = create<FavoritesStore>((set, get) => ({
    favorites: [],
    isLoading: false,
    error: null,

    fetchFavorites: async (userId) => {
        try {
            set({ isLoading: true, error: null });
            const res = await axiosInstance.get(`/favorites/${userId}`);
            set({ favorites: res.data.data || [], isLoading: false });
        } catch (err: any) {
            console.error("Error fetching favorites:", err.response?.data || err);
            set({
                error: err.response?.data?.message || "Không thể tải danh sách yêu thích",
                isLoading: false,
            });
        }
    },

    addFavorite: async (userId, itemId, itemType) => {
        try {
            if (!userId || !itemId || !itemType) {
                throw new Error("Thiếu thông tin cần thiết");
            }

            set({ isLoading: true, error: null });
            console.log("Adding favorite:", { userId, itemId, itemType });

            await axiosInstance.post("/favorites", { userId, itemId, itemType });
            await get().fetchFavorites(userId);
        } catch (err: any) {
            console.error("Error adding favorite:", err.response?.data || err);
            set({
                error: err.response?.data?.message || "Không thể thêm vào danh sách yêu thích",
                isLoading: false,
            });
            throw err; // Re-throw to handle in component
        }
    },

    removeFavorite: async (userId, itemId, itemType) => {
        try {
            if (!userId || !itemId || !itemType) {
                throw new Error("Thiếu thông tin cần thiết");
            }

            set({ isLoading: true, error: null });
            console.log("Removing favorite:", { userId, itemId, itemType });

            await axiosInstance.delete("/favorites", {
                data: { userId, itemId, itemType },
            });
            await get().fetchFavorites(userId);
        } catch (err: any) {
            console.error("Error removing favorite:", err.response?.data || err);
            set({
                error: err.response?.data?.message || "Không thể xóa khỏi danh sách yêu thích",
                isLoading: false,
            });
            throw err; // Re-throw to handle in component
        }
    },

    clearFavorites: () => set({ favorites: [], error: null }),
}));
