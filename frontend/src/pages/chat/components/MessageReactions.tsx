import React, { useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import { useChatStore } from '@/stores/useChatStore';

interface Reaction {
    userId: string;
    emoji: string;
    createAt: string;
}

interface MessageReactionsProps {
    messageId: string;
    reactions: Reaction[];
    isOwnMessage?: boolean;
}

const EMOJI_LIST = ['👍', '❤️', '😂', '😮', '😢', '🙏'];

export const MessageReactions: React.FC<MessageReactionsProps> = ({
    messageId,
    reactions,
    isOwnMessage = false,
}) => {
    const { user } = useUser();
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const { addReaction, removeReaction } = useChatStore();

    const handleReaction = async (emoji: string) => {
        try {
            const currentUserReaction = reactions.find(r => r.userId === user?.id);

            if (currentUserReaction?.emoji === emoji) {
                await removeReaction(messageId);
            } else {
                await addReaction(messageId, emoji);
            }

            setShowEmojiPicker(false);
        } catch (error) {
            console.error('Error handling reaction:', error);
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
        <div className="group relative">
            {/* Quick Reaction Picker - Only visible on hover */}
            <div className="absolute -top-8 left-0 right-0 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <div className="bg-white dark:bg-zinc-800 rounded-full px-3 py-1.5 flex gap-2 shadow-lg border border-gray-200 dark:border-zinc-700">
                    {EMOJI_LIST.map(emoji => (
                        <button
                            key={emoji}
                            onClick={() => handleReaction(emoji)}
                            className="hover:scale-125 transition-transform text-lg"
                        >
                            {emoji}
                        </button>
                    ))}
                </div>
            </div>

            {/* Existing Reactions */}
            {Object.keys(groupedReactions).length > 0 && (
                <div className={`flex gap-1 items-center mt-1 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
                    {Object.entries(groupedReactions).map(([emoji, reactions]) => (
                        <button
                            key={emoji}
                            onClick={() => handleReaction(emoji)}
                            className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs transition-colors
                                ${reactions.some(r => r.userId === user?.id)
                                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-200 hover:bg-blue-200 dark:hover:bg-blue-800'
                                    : 'bg-gray-100 dark:bg-zinc-700 hover:bg-gray-200 dark:hover:bg-zinc-600'}`}
                        >
                            <span>{emoji}</span>
                            {reactions.length > 1 && <span className="text-xs">{reactions.length}</span>}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};