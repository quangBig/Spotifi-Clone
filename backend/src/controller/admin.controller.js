import { Song } from "../models/song.model.js";
import { Album } from "../models/album.model.js";
import cloudinary from "../lib/cloudinary.js";

// helper function for cloudinary uploads
const uploadToCloudinary = async (file, type = "image") => {
	try {
		if (!file) {
			throw new Error("No file provided");
		}

		// Kiểm tra loại MIME
		const allowedTypes = {
			image: ["image/jpeg", "image/png", "image/gif", "image/webp"],
			audio: ["audio/mpeg", "audio/mp3", "audio/wav"],
			video: ["video/mp4"]
		};

		if (!allowedTypes[type]?.includes(file.mimetype)) {
			throw new Error(`Invalid ${type} file type`);
		}

		// Giới hạn kích thước (ảnh < 5MB, audio/video < 50MB)
		const sizeLimits = {
			image: 5 * 1024 * 1024,
			audio: 50 * 1024 * 1024,
			video: 100 * 1024 * 1024,
		};

		if (file.size > sizeLimits[type]) {
			throw new Error(`File size too large. Max ${sizeLimits[type] / 1024 / 1024}MB`);
		}

		// Upload
		const result = await cloudinary.uploader.upload(file.tempFilePath, {
			resource_type: type === "image" ? "image" : "video", // Cloudinary dùng "video" cho cả audio & video
			folder: "spotify-project",
			quality: "auto",
			fetch_format: "auto"
		});

		return result.secure_url;
	} catch (error) {
		console.log("Error in uploadToCloudinary", error);
		throw new Error(error.message || "Error uploading to cloudinary");
	}
};


export const createSong = async (req, res, next) => {
	try {
		if (!req.files || !req.files.audioFile || !req.files.imageFile) {
			return res.status(400).json({ message: "Please upload all files" });
		}


		const { title, artist, albumId, duration, lyrics } = req.body;
		if (!req.body.lyrics) {
			return res.status(400).json({ message: "Please add lyrics" });
		}
		const audioFile = req.files.audioFile;
		const imageFile = req.files.imageFile;

		const audioUrl = await uploadToCloudinary(audioFile, "audio"); // thêm "audio"
		const imageUrl = await uploadToCloudinary(imageFile, "image"); // rõ ràng hơn


		const song = new Song({
			title,
			artist,
			audioUrl,
			imageUrl,
			lyrics,
			duration,
			albumId: albumId || null,
		});

		await song.save();

		// if song belongs to an album, update the album's songs array
		if (albumId) {
			await Album.findByIdAndUpdate(albumId, {
				$push: { songs: song._id },
			});
		}
		res.status(201).json(song);
	} catch (error) {
		console.log("Error in createSong", error);
		next(error);
	}
};

export const deleteSong = async (req, res, next) => {
	try {
		const { id } = req.params;

		const song = await Song.findById(id);

		// if song belongs to an album, update the album's songs array
		if (song.albumId) {
			await Album.findByIdAndUpdate(song.albumId, {
				$pull: { songs: song._id },
			});
		}

		await Song.findByIdAndDelete(id);

		res.status(200).json({ message: "Song deleted successfully" });
	} catch (error) {
		console.log("Error in deleteSong", error);
		next(error);
	}
};

export const editSong = async (req, res, next) => {
	try {
		const { id } = req.params;
		const {
			title,
			artist,
			albumId,
			lyrics,
			duration,

		} = req.body;
		const song = await Song.findById(id);
		if (!song) {
			return res.status(400).json({ message: "Song not found" });
		}

		// Dữ liệu cập nhật
		const updateData = {
			title: title || song.title,
			artist: artist || song.artist,
			duration: duration || song.duration,
			lyrics: lyrics || song.lyrics,

		};
		// Xử lí albumId thay đổi
		if (albumId !== undefined && albumId !== song.albumId) {
			// Xoá bài hát khỏi album cũ ( nếu có )
			if (song.albumId) {
				await Album.findByIdAndUpdate(song.albumId, {
					$pull: { songs: song._id }
				});
			}
			// Thêm bài hát vào album mới ( nếu có )
			if (albumId) {
				await Album.findByIdAndUpdate(albumId, {
					$addToSet: { songs: song._id }
				});
			}
			updateData.albumId = albumId || null;
		}
		// Xử lí file âm thanh mới
		if (req.files?.audioFile) {
			const audioUrl = await uploadToCloudinary(req.files.audioFile, "audio");
			updateData.audioUrl = audioUrl;
		}
		if (req.files?.imageFile) {
			const imageUrl = await uploadToCloudinary(req.files.imageFile, "image");
			updateData.imageUrl = imageUrl;
		}

		// Cập nhật bài hát
		const updateSong = await Song.findByIdAndUpdate(id, updateData, {
			new: true
		})
		res.status(200).json(updateSong);
	} catch (error) {
		console.log("Error in editSong", error);
		next(error);
	}
}

export const createAlbum = async (req, res, next) => {
	try {
		const { title, artist, releaseYear } = req.body;
		const { imageFile } = req.files;

		const imageUrl = await uploadToCloudinary(imageFile);

		const album = new Album({
			title,
			artist,
			imageUrl,
			releaseYear,
		});

		await album.save();

		res.status(201).json(album);
	} catch (error) {
		console.log("Error in createAlbum", error);
		next(error);
	}
};

export const deleteAlbum = async (req, res, next) => {
	try {
		const { id } = req.params;
		await Song.deleteMany({ albumId: id });
		await Album.findByIdAndDelete(id);
		res.status(200).json({ message: "Album deleted successfully" });
	} catch (error) {
		console.log("Error in deleteAlbum", error);
		next(error);
	}
};
export const editAlbum = async (req, res, next) => {
	try {
		const { id } = req.params;
		const { title, artist, releaseYear } = req.body;

		const updateData = { title, artist, releaseYear };

		// nếu có file ảnh mới thì upload lên cloudinary
		if (req.files && req.files.imageFile) {
			const imageFile = req.files.imageFile;
			const imageUrl = await uploadToCloudinary(imageFile);
			updateData.imageUrl = imageUrl;
		}

		const updatedAlbum = await Album.findByIdAndUpdate(id, updateData, {
			new: true,
		});

		if (!updatedAlbum) {
			return res.status(404).json({ message: "Album not found" });
		}

		res.status(200).json(updatedAlbum);
	} catch (error) {
		console.log("Error in updateAlbum", error);
		next(error);
	}
};



export const checkAdmin = async (req, res, next) => {
	res.status(200).json({ admin: true });
};