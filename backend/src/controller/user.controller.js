import { User } from "../models/user.model.js";
import { Message } from "../models/message.model.js";

export const getAllUsers = async (req, res, next) => {
	try {
		const currentUserId = req.auth.userId;
		const users = await User.find({ clerkId: { $ne: currentUserId } });
		res.status(200).json(users);
	} catch (error) {
		next(error);
	}
};

export const getMessages = async (req, res, next) => {
	try {
		const myId = req.auth.userId;
		const { userId } = req.params;

		const messages = await Message.find({
			$or: [
				{ senderId: userId, receiverId: myId },
				{ senderId: myId, receiverId: userId },
			],
		}).sort({ createdAt: 1 });

		res.status(200).json(messages);
	} catch (error) {
		next(error);
	}
};

export const addReaction = async (req, res, next) => {
	try {
		const { messageId } = req.params;
		const { emoji } = req.body;
		const userId = req.auth.userId;

		if (!emoji) {
			return res.status(400).json({ message: "Emoji is required" });
		}

		const message = await Message.findById(messageId);
		if (!message) {
			return res.status(404).json({ message: "Message not found" });
		}

		// Remove existing reaction from this user if exists
		message.reactions = message.reactions.filter(
			reaction => reaction.userId !== userId
		);

		// Add new reaction
		message.reactions.push({ userId, emoji });
		await message.save();

		res.status(200).json(message);
	} catch (error) {
		next(error);
	}
};

export const removeReaction = async (req, res, next) => {
	try {
		const { messageId } = req.params;
		const userId = req.auth.userId;

		const message = await Message.findById(messageId);
		if (!message) {
			return res.status(404).json({ message: "Message not found" });
		}

		// Remove user's reaction
		message.reactions = message.reactions.filter(
			reaction => reaction.userId !== userId
		);

		await message.save();
		res.status(200).json(message);
	} catch (error) {
		next(error);
	}
};

export const updateMessage = async (req, res, next) => {
	try {
		const { messageId } = req.params;
		const { content } = req.body;
		const userId = req.auth.userId;

		if (!content || content.trim() === "") {
			return res.status(400).json({ message: "Content is required" });
		}

		const message = await Message.findById(messageId);
		if (!message) {
			return res.status(404).json({ message: "Message not found" });
		}

		if (message.senderId !== userId) {
			return res.status(403).json({ message: "You can only edit your own messages" });
		}

		message.content = content;
		await message.save();

		res.status(200).json(message);
	} catch (error) {
		next(error);
	}
};


export const deleteMessage = async (req, res, next) => {
	try {
		const { messageId } = req.params;
		const userId = req.auth.userId;

		const message = await Message.findById(messageId);
		if (!message) {
			return res.status(404).json({ message: "Message not found" });
		}

		if (message.senderId !== userId) {
			return res.status(403).json({ message: "You can only delete your own messages" });
		}

		await message.deleteOne();

		res.status(200).json({ message: "Message deleted successfully" });
	} catch (error) {
		console.error("❌ Error deleting message:", error);
		res.status(500).json({ message: "Internal Server Error" });
	}
};