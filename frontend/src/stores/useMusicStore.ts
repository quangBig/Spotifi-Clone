import { axiosInstance } from "@/lib/axios";
import { Album, Song, Stats } from "@/types";
import toast from "react-hot-toast";
import { create } from "zustand";

interface MusicStore {
	songs: Song[];
	albums: Album[];
	isLoading: boolean;
	error: string | null;
	currentAlbum: Album | null;
	featuredSongs: Song[];
	madeForYouSongs: Song[];
	trendingSongs: Song[];
	stats: Stats;

	fetchAlbums: () => Promise<void>;
	fetchAlbumById: (id: string) => Promise<void>;
	fetchFeaturedSongs: () => Promise<void>;
	fetchMadeForYouSongs: () => Promise<void>;
	fetchTrendingSongs: () => Promise<void>;
	fetchStats: () => Promise<void>;
	fetchSongs: () => Promise<void>;
	deleteSong: (id: string) => Promise<void>;
	deleteAlbum: (id: string) => Promise<void>;
	editAlbum: (id: string, data: any) => Promise<void>;
	editSong: (id: string, data: any) => Promise<void>;
}

export const useMusicStore = create<MusicStore>((set) => ({
	albums: [],
	songs: [],
	isLoading: false,
	error: null,
	currentAlbum: null,
	madeForYouSongs: [],
	featuredSongs: [],
	trendingSongs: [],
	stats: {
		totalSongs: 0,
		totalAlbums: 0,
		totalUsers: 0,
		totalArtists: 0,
	},
	editSong: async (id, data) => {
		set({ isLoading: true, error: null })
		try {
			const formData = new FormData();
			// Append các trường dữ liệu

			if (data.title) formData.append('title', data.title);
			if (data.artist) formData.append('artist', data.artist);
			if (data.duration) formData.append('duration', data.duration);
			if (data.albumId !== undefined) formData.append('albumId', data.albumId);

			if (data.audioFile) {
				formData.append("audioFile", data.audioFile); // Phải trùng tên với field backend mong đợi
			}
			if (data.imageFile) {
				formData.append("imageFile", data.imageFile); // Phải trùng tên với field backend mong đợi
			}

			const response = await axiosInstance.put(`/admin/songs/${id}`, formData, {
				headers: {
					'Content-Type': 'multipart/form-data'
				}
			})
			set((state) => ({
				songs: state.songs.map((song) =>
					song._id === id ? response.data : song
				),
			}));

			toast.success("Song updated successfully");
			return response.data;
		} catch (error: any) {
			console.log("Error updating song", error);
			toast.error("Failed to update album: " + error.message);
			throw error;
		} finally {
			set({ isLoading: false })
		}
	},
	deleteSong: async (id) => {
		set({ isLoading: true, error: null });
		try {
			await axiosInstance.delete(`/admin/songs/${id}`);

			set((state) => ({
				songs: state.songs.filter((song) => song._id !== id),
			}));
			toast.success("Song deleted successfully");
		} catch (error: any) {
			console.log("Error in deleteSong", error);
			toast.error("Error deleting song");
		} finally {
			set({ isLoading: false });
		}
	},
	editAlbum: async (id, data) => {  // Thêm tham số data
		set({ isLoading: true, error: null });
		try {
			const formData = new FormData();

			// Append các trường dữ liệu
			if (data.title) formData.append('title', data.title);
			if (data.artist) formData.append('artist', data.artist);
			if (data.releaseYear) formData.append('releaseYear', data.releaseYear);
			if (data.imageFile) {  // Nếu có file ảnh mới
				formData.append('image', data.imageFile);
			}

			const response = await axiosInstance.put(`/admin/albums/${id}`, formData, {
				headers: {
					'Content-Type': 'multipart/form-data',  // Đúng vị trí cho headers
				},
			});

			set((state) => ({
				albums: state.albums.map((album) =>
					album._id === id ? response.data : album
				),
			}));

			toast.success("Album updated successfully");
			return response.data;
		} catch (error: any) {
			console.log("Error updating album", error);
			toast.error("Failed to update album: " + error.message);
			throw error;
		} finally {
			set({ isLoading: false });
		}
	},

	deleteAlbum: async (id) => {
		set({ isLoading: true, error: null });
		try {
			await axiosInstance.delete(`/admin/albums/${id}`);
			set((state) => ({
				albums: state.albums.filter((album) => album._id !== id),
				songs: state.songs.map((song) =>
					song.albumId === state.albums.find((a) => a._id === id)?.title ? { ...song, album: null } : song
				),
			}));
			toast.success("Album deleted successfully");
		} catch (error: any) {
			toast.error("Failed to delete album: " + error.message);
		} finally {
			set({ isLoading: false });
		}
	},

	fetchSongs: async () => {
		set({ isLoading: true, error: null });
		try {
			const response = await axiosInstance.get("/songs");
			set({ songs: response.data });
		} catch (error: any) {
			set({ error: error.message });
		} finally {
			set({ isLoading: false });
		}
	},

	fetchStats: async () => {
		set({ isLoading: true, error: null });
		try {
			const response = await axiosInstance.get("/stats");
			set({ stats: response.data });
		} catch (error: any) {
			set({ error: error.message });
		} finally {
			set({ isLoading: false });
		}
	},

	fetchAlbums: async () => {
		set({ isLoading: true, error: null });

		try {
			const response = await axiosInstance.get("/albums");
			set({ albums: response.data });
		} catch (error: any) {
			set({ error: error.response.data.message });
		} finally {
			set({ isLoading: false });
		}
	},

	fetchAlbumById: async (id) => {
		set({ isLoading: true, error: null });
		try {
			const response = await axiosInstance.get(`/albums/${id}`);
			set({ currentAlbum: response.data });
		} catch (error: any) {
			set({ error: error.response.data.message });
		} finally {
			set({ isLoading: false });
		}
	},

	fetchFeaturedSongs: async () => {
		set({ isLoading: true, error: null });
		try {
			const response = await axiosInstance.get("/songs/featured");
			set({ featuredSongs: response.data });
		} catch (error: any) {
			set({ error: error.response.data.message });
		} finally {
			set({ isLoading: false });
		}
	},

	fetchMadeForYouSongs: async () => {
		set({ isLoading: true, error: null });
		try {
			const response = await axiosInstance.get("/songs/made-for-you");
			set({ madeForYouSongs: response.data });
		} catch (error: any) {
			set({ error: error.response.data.message });
		} finally {
			set({ isLoading: false });
		}
	},

	fetchTrendingSongs: async () => {
		set({ isLoading: true, error: null });
		try {
			const response = await axiosInstance.get("/songs/trending");
			set({ trendingSongs: response.data });
		} catch (error: any) {
			set({ error: error.response.data.message });
		} finally {
			set({ isLoading: false });
		}
	},
}));
