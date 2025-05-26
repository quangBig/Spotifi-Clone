import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useMusicStore } from "@/stores/useMusicStore";
import {Calendar, Music, Trash2, SquarePen, Check, X, Upload, Search} from "lucide-react";
import { useEffect, useState, useRef } from "react";

const AlbumsTable = () => {
	const { albums, deleteAlbum, fetchAlbums, editAlbum } = useMusicStore();
	const [editingId, setEditingId] = useState<string | null>(null);
	const [editData, setEditData] = useState({
		title: "",
		artist: "",
		releaseYear: "",
		imageUrl: ""
	});
	const [search, setSearch] = useState("");
	const filteredAlbums = albums.filter((album) =>
		album.title.toLowerCase().includes(search.toLowerCase()) ||
		album.artist.toLowerCase().includes(search.toLowerCase())
	);

	const fileInputRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		fetchAlbums();
	}, [fetchAlbums]);

	const handleEditClick = (album: any) => {
		setEditingId(album._id);
		setEditData({
			title: album.title,
			artist: album.artist,
			releaseYear: album.releaseYear,
			imageUrl: album.imageUrl
		});
	};

	const handleCancelEdit = () => {
		setEditingId(null);
	};


	const handleSaveEdit = async (id: string) => {
		try {
			await editAlbum(id, editData);  // Gửi cả editData
			setEditingId(null);
			fetchAlbums();
		} catch (error) {
			console.error("Failed to update album:", error);
		}
	};

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setEditData(prev => ({
			...prev,
			[name]: value
		}));
	};

	const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			const reader = new FileReader();
			reader.onloadend = () => {
				setEditData(prev => ({
					...prev,
					imageUrl: reader.result as string,
					imageFile: file  // Lưu cả file để gửi lên server
				}));
			};
			reader.readAsDataURL(file);
		}
	};


	const triggerFileInput = () => {
		fileInputRef.current?.click();
	};

	return (
		<>
			<div className="flex items-center gap-2  bg-zinc-700 border border-zinc-700  rounded-2xl px-4 py-2 shadow-md w-full max-w-md">

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
						<TableHead>Release Year</TableHead>
						<TableHead>Songs</TableHead>
						<TableHead className='text-right'>Actions</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{filteredAlbums.map((album) => (
						<TableRow key={album._id} className='hover:bg-zinc-800/50'>
							<TableCell>
								{editingId === album._id ? (
									<div className="flex flex-col items-center gap-2">
										{editData.imageUrl && (
											<img
												src={editData.imageUrl}
												alt="Preview"
												className="w-10 h-10 rounded object-cover mb-2"
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
									<img src={album.imageUrl} alt={album.title} className='w-10 h-10 rounded object-cover' />
								)}
							</TableCell>
							<TableCell className='font-medium'>
								{editingId === album._id ? (
									<input
										type="text"
										name="title"
										value={editData.title}
										onChange={handleInputChange}
										className="bg-zinc-800 border border-zinc-700 rounded px-2 py-1"
									/>
								) : (
									album.title
								)}
							</TableCell>
							<TableCell>
								{editingId === album._id ? (
									<input
										type="text"
										name="artist"
										value={editData.artist}
										onChange={handleInputChange}
										className="bg-zinc-800 border border-zinc-700 rounded px-2 py-1"
									/>
								) : (
									album.artist
								)}
							</TableCell>
							<TableCell>
								{editingId === album._id ? (
									<input
										type="text"
										name="releaseYear"
										value={editData.releaseYear}
										onChange={handleInputChange}
										className="bg-zinc-800 border border-zinc-700 rounded px-2 py-1 w-20"
									/>
								) : (
									<span className='inline-flex items-center gap-1 text-zinc-400'>
									<Calendar className='h-4 w-4' />
										{album.releaseYear}
								</span>
								)}
							</TableCell>
							<TableCell>
							<span className='inline-flex items-center gap-1 text-zinc-400'>
								<Music className='h-4 w-4' />
								{album.songs.length} songs
							</span>
							</TableCell>
							<TableCell className='text-right'>
								<div className='flex gap-2 justify-end'>
									{editingId === album._id ? (
										<>
											<Button
												variant='ghost'
												size='sm'
												onClick={() => handleSaveEdit(album._id)}
												className='text-green-400 hover:text-green-300 hover:bg-green-400/10'
											>
												<Check className='h-4 w-4' />
											</Button>
											<Button
												variant='ghost'
												size='sm'
												onClick={handleCancelEdit}
												className='text-red-400 hover:text-red-300 hover:bg-red-400/10'
											>
												<X className='h-4 w-4' />
											</Button>
										</>
									) : (
										<>
											<Button
												variant='ghost'
												size='sm'
												onClick={() => deleteAlbum(album._id)}
												className='text-red-400 hover:text-red-300 hover:bg-red-400/10'
											>
												<Trash2 className='h-4 w-4' />
											</Button>
											<Button
												variant='ghost'
												size='sm'
												onClick={() => handleEditClick(album)}
												className='text-blue-400 hover:text-blue-300 hover:bg-blue-400/10'
											>
												<SquarePen className='h-4 w-4' />
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

export default AlbumsTable;