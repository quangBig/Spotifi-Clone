// pages/Favorites.tsx
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import Topbar from "@/components/Topbar";
import { useFavoritesStore } from "@/stores/useFavoritesStore";
import { usePlayerStore } from "@/stores/usePlayerStore";
import { Clock, Play, Heart, Music, Album, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import toast from "react-hot-toast";

export const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
};

const Favorites = () => {
    const navigate = useNavigate();
    const { userId } = useAuth();
    const { favorites, isLoading, error, fetchFavorites, removeFavorite } = useFavoritesStore();
    const { currentSong, isPlaying, setCurrentSong } = usePlayerStore();
    const [activeTab, setActiveTab] = useState<'all' | 'songs' | 'albums'>('all');

    useEffect(() => {
        if (userId) {
            fetchFavorites(userId);
        }
    }, [fetchFavorites, userId]);

    // Lọc favorites theo tab
    const filteredFavorites = favorites.filter(fav => {
        if (activeTab === 'all') return true;
        if (activeTab === 'songs') return fav.itemType === 'Song';
        if (activeTab === 'albums') return fav.itemType === 'Album';
        return true;
    });

    const handleRemoveFavorite = async (itemId: string, itemType: 'Song' | 'Album') => {
        if (!userId) return;
        try {
            await removeFavorite(userId, itemId, itemType);
            toast.success("Đã xóa khỏi danh sách yêu thích");
        } catch (error) {
            console.error("Error removing favorite:", error);
        }
    };

    const handlePlaySong = (song: any) => {
        setCurrentSong(song);
    };

    const handleNavigateToAlbum = (albumId: string) => {
        navigate(`/albums/${albumId}`);
    };

    if (isLoading) {
        return (
            <div className="h-full">
                <Topbar />
                <div className="flex items-center justify-center h-96">
                    <div className="text-zinc-400">Loading favorites...</div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="h-full">
                <Topbar />
                <div className="flex items-center justify-center h-96">
                    <div className="text-red-400">Error: {error}</div>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full">
            <Topbar />
            <ScrollArea className="rounded-md overflow-hidden h-full bg-gradient-to-b from-zinc-800 to-zinc-900 ">
                <div className="p-6">
                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                                <Heart className="w-10 h-10 text-red-500 fill-current" />
                            </div>
                            <div>
                                <h1 className="text-4xl font-bold text-white mb-2">Your Favorites</h1>
                                <p className="text-zinc-400">{favorites.length} liked items</p>
                            </div>
                        </div>

                        {/* Tabs */}
                        <div className="flex gap-2 mb-6">
                            <Button
                                variant={activeTab === 'all' ? 'default' : 'ghost'}
                                onClick={() => setActiveTab('all')}
                                className="rounded-full"
                            >
                                All ({favorites.length})
                            </Button>
                            <Button
                                variant={activeTab === 'songs' ? 'default' : 'ghost'}
                                onClick={() => setActiveTab('songs')}
                                className="rounded-full"
                            >
                                Songs ({favorites.filter(f => f.itemType === 'Song').length})
                            </Button>
                            <Button
                                variant={activeTab === 'albums' ? 'default' : 'ghost'}
                                onClick={() => setActiveTab('albums')}
                                className="rounded-full"
                            >
                                Albums ({favorites.filter(f => f.itemType === 'Album').length})
                            </Button>
                        </div>
                    </div>

                    {/* Empty State */}
                    {filteredFavorites.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-96 text-center">
                            <Heart className="w-16 h-16 text-zinc-600 mb-4" />
                            <h3 className="text-xl font-semibold text-white mb-2">No favorites yet</h3>
                            <p className="text-zinc-400 mb-4">
                                {activeTab === 'all'
                                    ? "Songs and albums you like will appear here"
                                    : activeTab === 'songs'
                                        ? "Songs you like will appear here"
                                        : "Albums you like will appear here"
                                }
                            </p>
                            <Button
                                onClick={() => navigate('/')}
                                className="bg-white text-black hover:bg-zinc-200"
                            >
                                Discover Music
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {/* Table Header */}
                            <div className="grid grid-cols-[auto_1fr_auto_auto_auto] gap-4 px-4 py-2 text-sm text-zinc-400 border-b border-zinc-800">
                                <div className="w-6"></div>
                                <div>Title</div>
                                <div className="text-center -ml-20">Type</div>
                                <div className="text-center ">
                                    <Clock className="w-4 h-4 mx-auto" />
                                </div>
                                <div className="w-8"></div>
                            </div>

                            {/* Favorites List */}
                            {filteredFavorites.map((favorite, index) => {
                                const item = favorite.item;
                                // Skip rendering if item is not properly populated
                                if (!item) {
                                    console.warn('Favorite item not populated:', favorite);
                                    return null;
                                }

                                const isCurrentSong = currentSong?._id === item._id && favorite.itemType === 'Song';

                                return (
                                    <div
                                        key={favorite._id}
                                        className="grid grid-cols-[auto_1fr_auto_auto_auto] gap-4 px-4 py-3 rounded-lg hover:bg-zinc-800/50 group transition-colors"
                                    >
                                        {/* Play Button / Number */}
                                        <div className="w-6 flex items-center justify-center">
                                            {favorite.itemType === 'Song' ? (
                                                <>
                                                    {isCurrentSong && isPlaying ? (
                                                        <div className="text-green-500">♫</div>
                                                    ) : (
                                                        <>
                                                            <span className="group-hover:hidden text-zinc-400">
                                                                {index + 1}
                                                            </span>
                                                            <Button
                                                                size="sm"
                                                                variant="ghost"
                                                                className="hidden group-hover:flex w-6 h-6 p-0"
                                                                onClick={() => handlePlaySong(item)}
                                                            >
                                                                <Play className="w-3 h-3" />
                                                            </Button>
                                                        </>
                                                    )}
                                                </>
                                            ) : (
                                                <Album className="w-4 h-4 text-zinc-400" />
                                            )}
                                        </div>

                                        {/* Title and Artist */}
                                        <div
                                            className="flex items-center gap-3 min-w-0 cursor-pointer"
                                            onClick={() => {
                                                if (favorite.itemType === 'Album') {
                                                    handleNavigateToAlbum(item._id);
                                                } else {
                                                    handlePlaySong(item);
                                                }
                                            }}
                                        >
                                            <img
                                                src={item.imageUrl}
                                                alt={item.title}
                                                className="w-10 h-10 rounded object-cover flex-shrink-0"
                                            />
                                            <div className="min-w-0">
                                                <div className={`font-medium truncate ${isCurrentSong ? 'text-green-500' : 'text-white'}`}>
                                                    {item.title}
                                                </div>
                                                <div className="text-sm text-zinc-400 truncate">
                                                    {item.artist}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Type Badge */}
                                        <div className="flex items-center justify-center">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${favorite.itemType === 'Song'
                                                ? 'bg-blue-500/20 text-blue-400'
                                                : 'bg-purple-500/20 text-purple-400'
                                                }`}>
                                                {favorite.itemType === 'Song' ? (
                                                    <><Music className="w-3 h-3 inline mr-1" />Song</>
                                                ) : (
                                                    <><Album className="w-3 h-3 inline mr-1" />Album</>
                                                )}
                                            </span>
                                        </div>

                                        {/* Duration */}
                                        <div className="flex items-center justify-center text-sm text-zinc-400">
                                            {favorite.itemType === 'Song' && 'duration' in item ? formatDuration(item.duration) : '--:--'}
                                        </div>

                                        {/* Remove Button */}
                                        <div className="w-8 flex items-center justify-center">
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                className="opacity-0 group-hover:opacity-100 w-8 h-8 p-0 text-zinc-400 hover:text-red-400 transition-opacity"
                                                onClick={() => handleRemoveFavorite(favorite.itemId, favorite.itemType)}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </ScrollArea>
        </div>
    );
};

export default Favorites;