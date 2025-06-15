import Topbar from "@/components/Topbar";
import { usePlayerStore } from "@/stores/usePlayerStore";

const LyricsPage = () => {
    const { currentSong } = usePlayerStore();

    if (!currentSong) {
        return <div className="p-6 text-center text-zinc-400">No song selected</div>;
    }

    return (
        <>
            <Topbar />
            <div className="p-4 bg-zinc-900 min-h-screen">

                <h2 className="text-xl font-bold mb-4 text-white">Lyrics</h2>
                <div className="bg-zinc-800 rounded-lg overflow-hidden">
                    <div className="p-6 -ml-2">
                        <h3 className="text-2xl font-semibold mb-2 text-white">{currentSong.title}</h3>
                        <p className="text-zinc-400 mb-4">{currentSong.artist}</p>
                    </div>


                    <div
                        className="whitespace-pre-line text-zinc-300 p-6 pt-0 -ml-2"
                        style={{
                            lineHeight: '1.8',
                            maxHeight: 'calc(100vh - 400px)',
                            overflowY: 'auto',
                            scrollbarWidth: 'thin',
                        }}
                    >
                        {currentSong.lyrics}
                    </div>
                </div>

            </div>
        </>
    );
};

export default LyricsPage;