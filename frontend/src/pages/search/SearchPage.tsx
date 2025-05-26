import { Link, useParams, useSearchParams } from "react-router-dom";
import { useMusicStore } from "@/stores/useMusicStore";
import Topbar from "@/components/Topbar.tsx";
import { useEffect } from "react";


const SearchPage = () => {
    const [searchParams] = useSearchParams();
    const { albumId } = useParams();
    const query = searchParams.get("query") || "";

    const { albums, fetchAlbumById } = useMusicStore();

    useEffect(() => {
        if (albumId) fetchAlbumById(albumId);
    }, [fetchAlbumById, albumId]);

    console.log(albums, "albums")

    const filteredAlbums = albums.filter((album) =>
        album.title?.toLowerCase().includes(query.toLowerCase()) ||
        album.artist?.toLowerCase().includes(query.toLowerCase())
    );

    return (
        <>
            <Topbar />
            <div className="p-4">
                <h2 className="text-xl font-bold mb-4">Kết quả cho: "{query}"</h2>

                {filteredAlbums.length === 0 ? (
                    <p>Không tìm thấy kết quả nào.</p>
                ) : (
                    <div className="space-y-8">
                        {filteredAlbums.map((album) => {
                            return (
                                <div key={album._id} className="bg-zinc-800 p-4 rounded-lg">
                                    <Link to={`/albums/${album._id}`} className="flex gap-4 items-center">
                                        <img
                                            src={album.imageUrl}
                                            alt=""
                                            className="rounded-md w-32 h-32 object-cover"
                                        />
                                        <div>
                                            <h3 className="text-lg font-bold">{album.title}</h3>
                                            <p className="text-sm text-zinc-400">{album.artist}</p>
                                        </div>
                                    </Link>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </>
    );
};

export default SearchPage;
