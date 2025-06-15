import mongoose from "mongoose";

const favoriteSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        index: true // Add index for better query performance
    },
    itemId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        refPath: 'itemType'
    },
    itemType: {
        type: String,
        required: true,
        enum: ["Song", "Album"],
        index: true // Add index for better query performance
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Add compound index for faster queries
favoriteSchema.index({ userId: 1, itemId: 1, itemType: 1 }, { unique: true });

export const Favorite = mongoose.model("Favorite", favoriteSchema);
