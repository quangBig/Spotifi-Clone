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

		const message = await Message.findById(messageId);
		if (!message) {
			return res.status(404).json({ message: "Message not found" });
		}
		// Remove existing reaction from this user if exists

		message.reactions = message.reactions.filter((reaction) =>
			reaction.userId !== userId
		);
		// Add new reactions

		message.reactions.push({ userId, emoji });
		await message.save();

		res.status(200).json(message);

	} catch (error) {
		next(error);
	}
}


export const removeReaction = async (req, res, next) => {
	try {
		const { messageId } = req.params;
		const { emoji } = req.body

		const message = await Message.findById(messageId);
		if (!message) {
			return res.status(404).json({ message: "Message not found" });
		}

		message.reactions = message.reactions.filter(
			reaction => reaction.userId !== userId
		);

		await message.save();
		res.status(200).json(message);
	} catch (error) {
		next(error)
	}
}

