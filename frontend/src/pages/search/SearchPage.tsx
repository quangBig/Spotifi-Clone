import { Link, useParams, useSearchParams } from "react-router-dom";
import { useMusicStore } from "@/stores/useMusicStore";
import Topbar from "@/components/Topbar.tsx";
import { useEffect } from "react";
import PlayButton from "../home/components/PlayButton";


const SearchPage = () => {
    const [searchParams] = useSearchParams();
    const { albumId } = useParams();
    const query = searchParams.get("query") || "";

    const { albums, songs, fetchAlbumById, fetchSongs } = useMusicStore();
    console.log(songs, "song");


    useEffect(() => {
        if (albumId) fetchAlbumById(albumId);
        fetchSongs(); // Đảm bảo songs được load
    }, [fetchAlbumById, albumId, fetchSongs]);

    const filteredAlbums = albums.filter((album) =>
        album.title?.toLowerCase().includes(query.toLowerCase()) ||
        album.artist?.toLowerCase().includes(query.toLowerCase())
    );

    const filteredSongs = songs.filter((song) =>
        song.title?.toLowerCase().includes(query.toLowerCase()) ||
        song.artist?.toLowerCase().includes(query.toLowerCase())
    );

    return (
        <>
            <Topbar />
            <div className="p-4 bg-zinc-900 ">
                <h2 className="text-xl font-bold mb-4">Kết quả cho: "{query}"</h2>

                {filteredAlbums.length === 0 && filteredSongs.length === 0 ? (
                    <p>Không tìm thấy kết quả nào.</p>
                ) : (
                    <div className="space-y-8">
                        {/* Hiển thị albums */}
                        {filteredAlbums.length > 0 && (
                            <div>
                                <h3 className="text-lg font-semibold mb-4">Albums</h3>
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                    {filteredAlbums.map((album) => (
                                        <div key={album._id} className="bg-zinc-800 p-4 rounded-lg">
                                            <Link to={`/albums/${album._id}`} className="flex flex-col gap-2">
                                                <img
                                                    src={album.imageUrl}
                                                    alt={album.title}
                                                    className="rounded-md w-full aspect-square object-cover"
                                                />
                                                <div>
                                                    <h3 className="font-bold line-clamp-1">{album.title}</h3>
                                                    <p className="text-sm text-zinc-400 line-clamp-1">{album.artist}</p>
                                                </div>
                                            </Link>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Hiển thị songs */}
                        {filteredSongs.length > 0 && (
                            <div>
                                <h3 className="text-lg font-semibold mb-4">Bài hát</h3>
                                <div className="space-y-2">
                                    {filteredSongs.map((song) => (
                                        <div
                                            key={song._id}
                                            className='flex items-center bg-zinc-800/50 rounded-md overflow-hidden
         hover:bg-zinc-700/50 transition-colors group cursor-pointer relative'
                                        >
                                            <img
                                                src={song.imageUrl}
                                                alt={song.title}
                                                className='w-16 sm:w-20 h-16 sm:h-20 object-cover flex-shrink-0'
                                            />
                                            <div className='flex-1 p-4'>
                                                <p className='font-medium truncate'>{song.title}</p>
                                                <p className='text-sm text-zinc-400 truncate'>{song.artist}</p>
                                            </div>
                                            <PlayButton song={song} />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </>
    );
};

export default SearchPage;