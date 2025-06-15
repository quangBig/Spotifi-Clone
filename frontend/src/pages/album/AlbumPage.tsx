// pages/AlbumPage.tsx - Updated với favorites integration
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useMusicStore } from "@/stores/useMusicStore";
import { usePlayerStore } from "@/stores/usePlayerStore";
import { useFavoritesStore } from "@/stores/useFavoritesStore";
import { Clock, Ellipsis, Forward, Heart, MessageSquareWarning, Pause, Play } from "lucide-react";
import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import toast from "react-hot-toast";

export const formatDuration = (seconds: number) => {
	const minutes = Math.floor(seconds / 60);
	const remainingSeconds = seconds % 60;
	return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
};

const AlbumPage = () => {
	const { albumId } = useParams();
	const { userId } = useAuth();
	const { fetchAlbumById, currentAlbum, isLoading } = useMusicStore();
	const { currentSong, isPlaying, playAlbum, togglePlay } = usePlayerStore();
	const { favorites, addFavorite, removeFavorite } = useFavoritesStore();
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const menuRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (albumId) fetchAlbumById(albumId);
	}, [fetchAlbumById, albumId]);

	// Đóng menu khi click ra ngoài
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
				setIsMenuOpen(false);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, []);

	if (isLoading) return null;

	const isAlbumFavorite = currentAlbum ? favorites.some(fav =>
		fav.itemId === currentAlbum._id && fav.itemType === 'Album'
	) : false;

	const handlePlayAlbum = () => {
		if (!currentAlbum) return;

		const isCurrentAlbumPlaying = currentAlbum?.songs.some((song) => song._id === currentSong?._id);
		if (isCurrentAlbumPlaying) togglePlay();
		else {
			playAlbum(currentAlbum?.songs, 0);
		}
	};

	const handlePlaySong = (index: number) => {
		if (!currentAlbum) return;
		playAlbum(currentAlbum?.songs, index);
	};

	const handleMenuToggle = () => {
		setIsMenuOpen(!isMenuOpen);
	};

	const handleToggleFavorite = async () => {
		if (!currentAlbum || !userId) return;

		try {
			if (isAlbumFavorite) {
				await removeFavorite(userId, currentAlbum._id, 'Album');
				toast.success("Đã xóa khỏi danh sách yêu thích");
			} else {
				await addFavorite(userId, currentAlbum._id, 'Album');
				toast.success("Đã thêm vào danh sách yêu thích");
			}
		} catch (error: any) {
			console.error("Error toggling favorite:", error);
			// You might want to show a toast notification here
			toast.error("Đã có trong danh sách yêu thích");
		}
		setIsMenuOpen(false);
	};

	const handleShare = () => {
		// Logic chia sẻ
		console.log("Shared");
		setIsMenuOpen(false);
	};

	const handleReport = () => {
		// Logic báo cáo
		console.log("Reported");
		setIsMenuOpen(false);
	};

	// Function để toggle favorite cho từng bài hát
	const handleToggleSongFavorite = async (song: any, event: React.MouseEvent) => {
		if (!userId) return;
		event.stopPropagation(); // Ngăn không cho trigger play song

		const isSongFavorite = favorites.some(fav =>
			fav.itemId === song._id && fav.itemType === 'Song'
		);

		try {
			if (isSongFavorite) {
				await removeFavorite(userId, song._id, 'Song');
				toast.success("Đã xóa khỏi danh sách yêu thích");
			} else {
				await addFavorite(userId, song._id, 'Song');
				toast.success("Đã thêm vào danh sách yêu thích");
			}
		} catch (error: any) {
			console.error("Error toggling song favorite:", error);
			// You might want to show a toast notification here
			toast.error("Đã có trong danh sách yêu thích");
		}
	};

	return (
		<div className='h-full'>
			<ScrollArea className='h-full rounded-md'>
				<div className='relative min-h-full'>
					<div
						className='absolute inset-0 bg-gradient-to-b from-[#5038a0]/80 via-zinc-900/80
             to-zinc-900 pointer-events-none'
						aria-hidden='true'
					/>

					<div className='relative z-10'>
						<div className='flex p-6 gap-6 pb-8'>
							<img
								src={currentAlbum?.imageUrl}
								alt={currentAlbum?.title}
								className='w-[240px] h-[240px] shadow-xl rounded'
							/>
							<div className='flex flex-col justify-end'>
								<p className='text-sm font-medium'>Album</p>
								<h1 className='text-7xl font-bold my-4'>{currentAlbum?.title}</h1>
								<div className='flex items-center gap-2 text-sm text-zinc-100'>
									<span className='font-medium text-white'>{currentAlbum?.artist}</span>
									<span>• {currentAlbum?.songs.length} songs</span>
									<span>• {currentAlbum?.releaseYear}</span>
								</div>
							</div>
						</div>

						<div className='px-6 pb-4 flex items-center gap-6'>
							<Button
								onClick={handlePlayAlbum}
								size='icon'
								className='w-14 h-14 rounded-full bg-green-500 hover:bg-green-400 
                hover:scale-105 transition-all'
							>
								{isPlaying && currentAlbum?.songs.some((song) => song._id === currentSong?._id) ? (
									<Pause className='h-7 w-7 text-black' />
								) : (
									<Play className='h-7 w-7 text-black' />
								)}
							</Button>

							{/* Heart Button for Quick Favorite */}
							<Button
								onClick={handleToggleFavorite}
								size='icon'
								className={`w-14 h-14 rounded-full transition-all hover:scale-105 ${isAlbumFavorite
									? 'bg-red-500/20 hover:bg-red-500/30 text-red-500'
									: 'bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white'
									}`}
							>
								<Heart className={`h-6 w-6 ${isAlbumFavorite ? 'fill-current' : ''}`} />
							</Button>

							{/* Menu Dropdown */}
							<div className='relative' ref={menuRef}>
								<Button
									onClick={handleMenuToggle}
									size='icon'
									className='w-14 h-14 rounded-full bg-zinc-900 hover:bg-zinc-800 text-white text-xl
                  hover:scale-105 transition-all'
								>
									<Ellipsis />
								</Button>

								{isMenuOpen && (
									<div className='absolute -right-48 mt-2 w-60 bg-zinc-800 rounded-md shadow-lg z-50 border border-zinc-700'>
										<div className='py-1'>


											<button
												onClick={handleShare}
												className='block w-full text-left px-4 py-2 text-sm text-zinc-200 hover:bg-zinc-700'
											>
												<div className="flex items-center gap-4">
													<Forward /> Share
												</div>
											</button>
											<button
												onClick={handleReport}
												className='block w-full text-left px-4 py-2 text-sm text-zinc-200 hover:bg-zinc-700'
											>
												<div className="flex items-center gap-4">
													<MessageSquareWarning /> Report
												</div>
											</button>
										</div>
									</div>
								)}
							</div>
						</div>

						{/* Songs List */}
						<div className='bg-black/20 backdrop-blur-sm'>
							<div
								className='grid grid-cols-[16px_4fr_2fr_1fr_auto] gap-4 px-10 py-2 text-sm 
                text-zinc-400 border-b border-white/5'
							>
								<div>#</div>
								<div>Title</div>
								<div>Released Date</div>
								<div>
									<Clock className='h-4 w-4' />
								</div>
								<div className='w-8'></div>
							</div>

							<div className='px-6'>
								<div className='space-y-2 py-4'>
									{currentAlbum?.songs.map((song, index) => {
										const isCurrentSong = currentSong?._id === song._id;
										const isSongFavorite = favorites.some(fav =>
											fav.itemId === song._id && fav.itemType === 'Song'
										);

										return (
											<div
												key={song._id}
												onClick={() => handlePlaySong(index)}
												className={`grid grid-cols-[16px_4fr_2fr_1fr_auto] gap-4 px-4 py-2 text-sm 
                        text-zinc-400 hover:bg-white/5 rounded-md group cursor-pointer
                        `}
											>
												<div className='flex items-center justify-center'>
													{isCurrentSong && isPlaying ? (
														<div className='size-4 text-green-500'>♫</div>
													) : (
														<span className='group-hover:hidden'>{index + 1}</span>
													)}
													{!isCurrentSong && (
														<Play className='h-4 w-4 hidden group-hover:block' />
													)}
												</div>

												<div className='flex items-center gap-3'>
													<img src={song.imageUrl} alt={song.title} className='size-10' />

													<div>
														<div className={`font-medium text-white`}>{song.title}</div>
														<div>{song.artist}</div>
													</div>
												</div>

												<div className='flex items-center'>{song.createdAt.split("T")[0]}</div>
												<div className='flex items-center'>{formatDuration(song.duration)}</div>

												{/* Heart button for individual songs */}
												<div className='flex items-center justify-center w-8'>
													<Button
														size="sm"
														variant="ghost"
														className={`opacity-0 group-hover:opacity-100 w-8 h-8 p-0 transition-all ${isSongFavorite ? 'opacity-100 text-red-500' : 'text-zinc-400 hover:text-red-400'
															}`}
														onClick={(e) => handleToggleSongFavorite(song, e)}
													>
														<Heart className={`w-4 h-4 ${isSongFavorite ? 'fill-current' : ''}`} />
													</Button>
												</div>
											</div>
										);
									})}
								</div>
							</div>
						</div>
					</div>
				</div>
			</ScrollArea>
		</div>
	);
};

export default AlbumPage;