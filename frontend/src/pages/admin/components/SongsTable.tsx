import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useMusicStore } from "@/stores/useMusicStore";
import { Calendar, Trash2, SquarePen, Check, X, Upload, Search } from "lucide-react";
import { useState, useRef } from "react";
import toast from "react-hot-toast";

const SongsTable = () => {
	const { songs, isLoading, error, deleteSong, editSong } = useMusicStore();

	const [editingId, setEditingId] = useState<string | null>(null);
	const [editData, setEditData] = useState({
		title: "",
		artist: "",
		imageUrl: "",
		lyrics: "",
		duration: ""
	});

	const [search, setSearch] = useState("");
	const filterSong = songs.filter((song) =>
		song.title.toLowerCase().includes(search.toLowerCase()) ||
		song.artist.toLowerCase().includes(search.toLowerCase())
	);

	const fileInputRef = useRef<HTMLInputElement>(null);
	const lyricsTextareaRef = useRef<HTMLTextAreaElement>(null);

	const handleEditClick = (song: any) => {
		setEditingId(song._id);
		setEditData({
			title: song.title,
			artist: song.artist,
			imageUrl: song.imageUrl,
			lyrics: song.lyrics,
			duration: song.duration
		});

		// Focus vào textarea lyrics khi mở chỉnh sửa
		setTimeout(() => {
			lyricsTextareaRef.current?.focus();
		}, 0);
	};

	const handleDelete = async (id: string) => {
		try {
			const isConfirm = window.confirm("Are you sure you want to delete this song?");
			if (!isConfirm) return;
			await deleteSong(id);
			toast.success("Song deleted successfully");
		} catch (err) {
			toast.error("Failed to delete song");
		}
	};

	const handleCancelEdit = () => {
		setEditingId(null);
	};

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setEditData(prev => ({ ...prev, [name]: value }));
	};

	const handleLyricsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
		setEditData(prev => ({ ...prev, lyrics: e.target.value }));
	};

	const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			const reader = new FileReader();
			reader.onloadend = () => {
				setEditData(prev => ({
					...prev,
					imageUrl: reader.result as string
				}));
			};
			reader.readAsDataURL(file);
		}
	};

	const triggerFileInput = () => {
		fileInputRef.current?.click();
	};

	const handleSaveEdit = async (id: string) => {
		try {
			await editSong(id, editData);
			setEditingId(null);
			toast.success("Song updated successfully");
		} catch (err) {
			console.error("Failed to update song:", err);
			toast.error("Failed to update song");
		}
	};

	if (isLoading) {
		return <div className='flex items-center justify-center py-8 text-zinc-400'>Loading songs...</div>;
	}

	if (error) {
		return <div className='flex items-center justify-center py-8 text-red-400'>{error}</div>;
	}

	return (
		<>
			<div className="flex items-center gap-2 bg-zinc-700 border border-zinc-700 rounded-2xl px-4 py-2 shadow-md w-full max-w-md mb-4">
				<input
					type="text"
					placeholder="Tìm kiếm..."
					value={search}
					onChange={(e) => setSearch(e.target.value)}
					className="outline-none w-full text-sm bg-transparent"
				/>
				<button>
					<Search className="text-gray-500 w-5 h-5" />
				</button>
			</div>

			<Table>
				<TableHeader>
					<TableRow className='hover:bg-zinc-800/50'>
						<TableHead className='w-[50px]'></TableHead>
						<TableHead>Title</TableHead>
						<TableHead>Artist</TableHead>
						<TableHead>Duration</TableHead>
						<TableHead>Release Date</TableHead>
						<TableHead>Lyrics</TableHead>
						<TableHead className='text-right'>Actions</TableHead>
					</TableRow>
				</TableHeader>

				<TableBody>
					{filterSong.map((song) => (
						<TableRow key={song._id} className='hover:bg-zinc-800/50'>
							<TableCell>
								{editingId === song._id ? (
									<div className="flex flex-col items-center gap-2">
										{editData.imageUrl && (
											<img
												src={editData.imageUrl}
												alt="Preview"
												className="w-10 h-10 rounded object-cover"
											/>
										)}
										<Button
											variant="outline"
											size="sm"
											onClick={triggerFileInput}
											className="flex items-center gap-1"
										>
											<Upload className="h-4 w-4" />
											Upload
										</Button>
										<input
											type="file"
											ref={fileInputRef}
											onChange={handleImageUpload}
											accept="image/*"
											className="hidden"
										/>
									</div>
								) : (
									<img src={song.imageUrl} alt={song.title} className='size-10 rounded object-cover' />
								)}
							</TableCell>

							<TableCell className='font-medium'>
								{editingId === song._id ? (
									<input
										type="text"
										name="title"
										value={editData.title}
										onChange={handleInputChange}
										className="bg-zinc-800 border border-zinc-700 rounded px-2 py-1 w-full"
									/>
								) : (
									song.title
								)}
							</TableCell>

							<TableCell>
								{editingId === song._id ? (
									<input
										type="text"
										name="artist"
										value={editData.artist}
										onChange={handleInputChange}
										className="bg-zinc-800 border border-zinc-700 rounded px-2 py-1 w-full"
									/>
								) : (
									song.artist
								)}
							</TableCell>

							<TableCell>
								{editingId === song._id ? (
									<input
										type="text"
										name="duration"
										value={editData.duration}
										onChange={handleInputChange}
										className="bg-zinc-800 border border-zinc-700 rounded px-2 py-1 w-full"
									/>
								) : (
									song.duration
								)}
							</TableCell>

							<TableCell>
								<span className='inline-flex items-center gap-1 text-zinc-400'>
									<Calendar className='h-4 w-4' />
									{song.createdAt.split("T")[0]}
								</span>
							</TableCell>

							<TableCell className="max-w-[300px]">
								{editingId === song._id ? (
									<textarea
										ref={lyricsTextareaRef}
										name="lyrics"
										value={editData.lyrics}
										onChange={handleLyricsChange}
										className="bg-zinc-800 border border-zinc-700 rounded px-2 py-1 w-full h-24 whitespace-pre-line"
										style={{ resize: "vertical" }}
									/>
								) : (
									<div className="whitespace-pre-line line-clamp-3 max-h-[60px] overflow-hidden">
										{song.lyrics}
									</div>
								)}
							</TableCell>

							<TableCell className='text-right'>
								<div className='flex gap-2 justify-end'>
									{editingId === song._id ? (
										<>
											<Button
												variant="ghost"
												size="sm"
												onClick={() => handleSaveEdit(song._id)}
												className="text-green-400 hover:text-green-300 hover:bg-green-400/10"
											>
												<Check className="size-4" />
											</Button>
											<Button
												variant="ghost"
												size="sm"
												onClick={handleCancelEdit}
												className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
											>
												<X className="size-4" />
											</Button>
										</>
									) : (
										<>
											<Button
												variant="ghost"
												size="sm"
												onClick={() => handleDelete(song._id)}
												className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
											>
												<Trash2 className="size-4" />
											</Button>
											<Button
												variant="ghost"
												size="sm"
												onClick={() => handleEditClick(song)}
												className="text-blue-400 hover:text-blue-300 hover:bg-blue-400/10"
											>
												<SquarePen className="size-4" />
											</Button>
										</>
									)}
								</div>
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</>
	);
};

export default SongsTable;