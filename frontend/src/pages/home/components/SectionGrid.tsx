import { Song } from "@/types";
import SectionGridSkeleton from "./SectionGridSkeleton";
import { Button } from "@/components/ui/button";
import PlayButton from "./PlayButton";

type SectionGridProps = {
	title: string;
	songs: Song[];
	isLoading: boolean;
};

const SectionGrid = ({ songs, title, isLoading }: SectionGridProps) => {
	if (isLoading) return <SectionGridSkeleton />;

	return (
		<div className="mb-8">
			<div className="flex items-center justify-between mb-4">
				<h2 className="text-xl sm:text-2xl font-bold">{title}</h2>
				<Button
					variant="link"
					className="text-sm text-zinc-400 hover:text-white"
				>
					Show all
				</Button>
			</div>

			<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-6">
				{songs.map((song) => (
					<div
						key={song._id}
						className="bg-zinc-800/40 p-4 rounded-md hover:bg-zinc-700/40 transition-all group cursor-pointer"
					>
						{/* Đĩa hát */}
						<div className="relative mb-4">
							<div className="aspect-square rounded-full overflow-hidden border-4 border-zinc-700 shadow-lg transition-transform duration-300 group-hover:scale-105">
								<img
									src={song.imageUrl}
									alt={song.title}
									className="w-full h-full object-cover rounded-full "
								/>
							</div>

							{/* Nút play nằm giữa đĩa */}
							<div className="absolute inset-0 flex items-center justify-center">
								<PlayButton song={song} />
							</div>
						</div>

						{/* Tiêu đề & nghệ sĩ */}
						<h3 className="font-medium mb-1 truncate">{song.title}</h3>
						<p className="text-sm text-zinc-400 truncate">{song.artist}</p>
					</div>
				))}
			</div>
		</div>
	);
};

export default SectionGrid;
