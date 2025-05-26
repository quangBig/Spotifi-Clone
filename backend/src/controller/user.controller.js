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

export const postFavorites = async (req, res, next) => {
	try{
		const userId = req.user._id;
		const { itemId } = req.body;
		const user = await User.findById(userId)
		if(user.favorites.includes(itemId)) {
			return res.status(400).json({message: "Đã có trong danh sách yêu thích"})
		}

		user.favorites.push(itemId);
		await user.save();

		res.status(201).json({message: "Đã thêm vào favorites", favorites:user.favorites})
	} catch (error) {
		next(error);
	}
}

export const deleteFavorites = async (req, res, next) => {
	try{
		const userId = req.user._id;
		const { id: itemdId } = req.params;

		const user = await User.findById(userId)

		// check có trong danh sách hay không
		if(!user.favorites.includes(itemdId)){
			return res.status(404).json({message: "không tồn tại trong favorites"})
		}


		user.favorites = user.favorites.filter(id => id.toString() !== itemId)
		await user.save()

		res.status(200).json({message:"Đã xóa khỏi favorites", favorites: user.favorites})
	} catch (error) {
		next(error);
	}
}

export const getUserFavorites = async (req, res, next) => {
	try {
		const userId = req.user._id;

		const user = await User.findById(userId).populate("favorites");
		if (!user) {
			return res.status(404).json({ message: "User không tồn tại" });
		}

		res.status(200).json(user.favorites);
	} catch (error) {
		next(error);
	}
}

