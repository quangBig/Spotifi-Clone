import { axiosInstance } from "@/lib/axios";
import { Message, User } from "@/types";
import { create } from "zustand";
import { io } from "socket.io-client";

interface ChatStore {
	users: User[];
	isLoading: boolean;
	error: string | null;
	socket: any;
	isConnected: boolean;
	onlineUsers: Set<string>;
	userActivities: Map<string, string>;
	messages: Message[];
	selectedUser: User | null;

	fetchUsers: () => Promise<void>;
	initSocket: (userId: string) => void;
	disconnectSocket: () => void;
	sendMessage: (receiverId: string, senderId: string, content: string) => void;
	fetchMessages: (userId: string) => Promise<void>;
	setSelectedUser: (user: User | null) => void;
	addReaction: (messageId: string, emoji: string) => Promise<void>;
	removeReaction: (messageId: string) => Promise<void>;
	updateMessage: (updatedMessage: Message) => void;
	editMessage: (messageId: string, newContent: string) => Promise<void>;
	deleteMessage: (messageId: string) => Promise<void>;
}

const baseURL = import.meta.env.MODE === "development" ? "http://localhost:5000" : "/";

const socket = io(baseURL, {
	autoConnect: false, // only connect if user is authenticated
	withCredentials: true,
});

export const useChatStore = create<ChatStore>((set, get) => ({
	users: [],
	isLoading: false,
	error: null,
	socket: socket,
	isConnected: false,
	onlineUsers: new Set(),
	userActivities: new Map(),
	messages: [],
	selectedUser: null,

	setSelectedUser: (user) => set({ selectedUser: user }),

	updateMessage: (updatedMessage) => {
		set((state) => ({
			messages: state.messages.map((msg) =>
				msg._id === updatedMessage._id ? updatedMessage : msg
			),
		}));
	},

	fetchUsers: async () => {
		set({ isLoading: true, error: null });
		try {
			const response = await axiosInstance.get("/users");
			set({ users: response.data });
		} catch (error: any) {
			set({ error: error.response.data.message });
		} finally {
			set({ isLoading: false });
		}
	},

	initSocket: (userId) => {
		if (!get().isConnected) {
			socket.auth = { userId };
			socket.connect();

			socket.emit("user_connected", userId);

			socket.on("users_online", (users: string[]) => {
				set({ onlineUsers: new Set(users) });
			});

			socket.on("activities", (activities: [string, string][]) => {
				set({ userActivities: new Map(activities) });
			});

			socket.on("user_connected", (userId: string) => {
				set((state) => ({
					onlineUsers: new Set([...state.onlineUsers, userId]),
				}));
			});

			socket.on("user_disconnected", (userId: string) => {
				set((state) => {
					const newOnlineUsers = new Set(state.onlineUsers);
					newOnlineUsers.delete(userId);
					return { onlineUsers: newOnlineUsers };
				});
			});

			socket.on("receive_message", (message: Message) => {
				set((state) => ({
					messages: [...state.messages, message],
				}));
			});

			socket.on("message_sent", (message: Message) => {
				set((state) => ({
					messages: [...state.messages, message],
				}));
			});

			socket.on("reactions_added", (updatedMessage: Message) => {
				get().updateMessage(updatedMessage);
			});

			socket.on("reactions_removed", (updatedMessage: Message) => {
				get().updateMessage(updatedMessage);
			});

			socket.on("activity_updated", ({ userId, activity }) => {
				set((state) => {
					const newActivities = new Map(state.userActivities);
					newActivities.set(userId, activity);
					return { userActivities: newActivities };
				});
			});

			set({ isConnected: true });
		}
	},

	disconnectSocket: () => {
		if (get().isConnected) {
			socket.disconnect();
			set({ isConnected: false });
		}
	},

	sendMessage: async (receiverId, senderId, content) => {
		const socket = get().socket;
		if (!socket) return;

		socket.emit("send_message", { receiverId, senderId, content });
	},

	fetchMessages: async (userId: string) => {
		set({ isLoading: true, error: null });
		try {
			const response = await axiosInstance.get(`/users/messages/${userId}`);
			set({ messages: response.data });
		} catch (error: any) {
			set({ error: error.response.data.message });
		} finally {
			set({ isLoading: false });
		}
	},

	addReaction: async (messageId: string, emoji: string) => {
		try {
			const response = await axiosInstance.post(`/users/messages/${messageId}/reactions`, { emoji });
			const socket = get().socket;
			if (socket) {
				socket.emit("reactions_added", response.data);
				get().updateMessage(response.data);
			}
		} catch (error: any) {
			set({ error: error.response.data.message });
		}
	},

	removeReaction: async (messageId: string) => {
		try {
			const response = await axiosInstance.delete(`/users/messages/${messageId}/reactions`);
			const socket = get().socket;
			if (socket) {
				socket.emit("reactions_removed", response.data);
				get().updateMessage(response.data);
			}
		} catch (error: any) {
			set({ error: error.response.data.message });
		}
	},

	editMessage: async (messageId, newContent) => {
		try {
			const response = await axiosInstance.put(`/users/messages/${messageId}`, {
				content: newContent,
			});

			const socket = get().socket;
			if (socket) {
				socket.emit("message_edited", response.data);
			}

			get().updateMessage(response.data);
		} catch (error: any) {
			set({ error: error.response?.data?.message || "Edit failed" });
		}
	},

	deleteMessage: async (messageId) => {
		try {
			await axiosInstance.delete(`/users/messages/${messageId}`);

			const socket = get().socket;
			if (socket) {
				socket.emit("message_deleted", { messageId });
			}

			// Remove from store
			set((state) => ({
				messages: state.messages.filter((m) => m._id !== messageId),
			}));
		} catch (error: any) {
			set({ error: error.response?.data?.message || "Delete failed" });
		}
	},

}));
