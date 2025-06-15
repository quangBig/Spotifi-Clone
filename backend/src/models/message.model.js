import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
	{
		senderId: { type: String, required: true }, // Clerk user ID
		receiverId: { type: String, required: true }, // Clerk user ID
		content: { type: String, required: true },
		reactions: [{
			userId: { type: String, require: true },
			emoji: { type: String, require: true },
			createAt: { type: Date, default: Date.now }
		}]

	},
	{ timestamps: true }
);

export const Message = mongoose.model("Message", messageSchema);
