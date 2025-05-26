import Topbar from "@/components/Topbar"
import { usePlayerStore } from "@/stores/usePlayerStore";

const LyricsPage = () => {
    const { currentSong } = usePlayerStore();
    if (!currentSong) {
        return <div className="p-6 text-center text-zinc-400"> No song selected </div>
    }
    return (
        <>
            <Topbar />
            <div className="p-4">
                <h2 className="text-xl font-bold mb-4">Lyrics</h2>
                <p>{currentSong?.lyrics}</p>
            </div>

        </>
    )
}

export default LyricsPage
