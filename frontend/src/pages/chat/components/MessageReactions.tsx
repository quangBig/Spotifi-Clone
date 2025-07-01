import React, { useState } from "react";
import { useUser } from "@clerk/clerk-react";
import { useChatStore } from "@/stores/useChatStore";

interface Reaction {
    userId: string;
    emoji: string;
    createAt: string;
}

interface MessageReactionsProps {
    messageId: string;
    reactions: Reaction[];
    isOwnMessage?: boolean;
    originalContent?: string; // thêm nếu bạn muốn sửa nội dung
}

const EMOJI_LIST = ["👍", "❤️", "😂", "😮", "😢", "🙏"];

export const MessageReactions: React.FC<MessageReactionsProps> = ({
    messageId,
    reactions,
    isOwnMessage = false,
    originalContent = "", // default nếu không truyền vào
}) => {
    const { user } = useUser();
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [newContent, setNewContent] = useState(originalContent);

    const { addReaction, removeReaction, editMessage, deleteMessage } =
        useChatStore();

    const handleReaction = async (emoji: string) => {
        try {
            const currentUserReaction = reactions.find(
                (r) => r.userId === user?.id
            );

            if (currentUserReaction?.emoji === emoji) {
                await removeReaction(messageId);
            } else {
                await addReaction(messageId, emoji);
            }

            setShowEmojiPicker(false);
        } catch (error) {
            console.error("Error handling reaction:", error);
        }
    };

    const handleEdit = async () => {
        if (!newContent.trim()) return;
        await editMessage(messageId, newContent.trim());
        setIsEditing(false);
    };

    const handleDelete = async () => {
        if (confirm("Bạn có chắc muốn xóa tin nhắn này?")) {
            await deleteMessage(messageId);
        }
    };

    // Group reactions by emoji
    const groupedReactions = reactions.reduce((acc, reaction) => {
        if (!acc[reaction.emoji]) {
            acc[reaction.emoji] = [];
        }
        acc[reaction.emoji].push(reaction);
        return acc;
    }, {} as Record<string, Reaction[]>);

    return (

        <div className="group relative w-full">
            {showEmojiPicker && (
                <div> Emoji picker ở đây </div>
            )}
            {/* Action bar: Emoji + Sửa/Xóa */}
            <div
                className={`
		absolute -top-10 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10 border border-gray-200 dark:border-zinc-700 rounded-full p-1
		${isOwnMessage ? 'right-[calc(100%+20px)]' : 'left-[calc(100%+8px)]'}
	`}
            >


                {/* Emoji Picker */}
                <div className="bg-white dark:bg-zinc-800 rounded-full px-3 py-1.5 flex gap-2 shadow-lg border border-gray-200 dark:border-zinc-700">
                    {EMOJI_LIST.map((emoji) => (
                        <button
                            key={emoji}
                            onClick={() => handleReaction(emoji)}
                            className="hover:scale-125 transition-transform text-lg"
                        >
                            {emoji}
                        </button>
                    ))}
                </div>

                {/* Sửa / Xóa nếu là tin của mình */}
                {isOwnMessage && !isEditing && (
                    <div className="flex gap-2 ml-2 mr-2">
                        <button
                            onClick={() => setIsEditing(true)}
                            className="text-xs text-blue-500 hover:underline"
                        >
                            Sửa
                        </button>
                        <button
                            onClick={handleDelete}
                            className="text-xs text-red-500 hover:underline"
                        >
                            Xóa
                        </button>
                    </div>
                )}
            </div>

            {/* Inline Edit UI */}
            {isEditing && (
                <div className="flex items-center gap-2 mt-1">
                    <input
                        value={newContent}
                        onChange={(e) => setNewContent(e.target.value)}
                        className="w-full p-1 text-black border rounded text-sm"
                    />
                    <button
                        onClick={handleEdit}
                        className="text-white text-xs hover:underline"
                    >
                        Lưu
                    </button>
                    <button
                        onClick={() => {
                            setIsEditing(false);
                            setNewContent(originalContent);
                        }}
                        className="text-white text-xs hover:underline"
                    >
                        Hủy
                    </button>
                </div>
            )}

            {/* Reactions display */}
            {Object.keys(groupedReactions).length > 0 && (
                <div
                    className={`flex gap-1 items-center mt-1 ${isOwnMessage ? "justify-end" : "justify-start"
                        }`}
                >
                    {Object.entries(groupedReactions).map(
                        ([emoji, reactions]) => (
                            <button
                                key={emoji}
                                onClick={() => handleReaction(emoji)}
                                className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs transition-colors
                                ${reactions.some(
                                    (r) =>
                                        r.userId ===
                                        user?.id
                                )
                                        ? "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-200 hover:bg-blue-200 dark:hover:bg-blue-800"
                                        : "bg-gray-100 dark:bg-zinc-700 hover:bg-gray-200 dark:hover:bg-zinc-600"
                                    }`}
                            >
                                <span>{emoji}</span>
                                {reactions.length > 1 && (
                                    <span className="text-xs">
                                        {reactions.length}
                                    </span>
                                )}
                            </button>
                        )
                    )}
                </div>
            )}
        </div>
    );

};
