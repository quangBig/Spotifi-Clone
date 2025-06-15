import { SignedOut, UserButton } from "@clerk/clerk-react";
import { LayoutDashboardIcon, Search } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import SignInOAuthButtons from "./SignInOAuthButtons";
import { useAuthStore } from "@/stores/useAuthStore";
import { cn } from "@/lib/utils";
import { buttonVariants } from "./ui/button";
import { useState } from "react";

const Topbar = () => {
	const { isAdmin } = useAuthStore();
	const [search, setSearch] = useState("");
	const navigate = useNavigate();

	const handleSearch = (e: React.FormEvent) => {
		e.preventDefault();
		if (search.trim()) {
			navigate(`/search?query=${encodeURIComponent(search.trim())}`);
		}
	};

	return (
		<div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 sticky top-0 bg-zinc-900/75 backdrop-blur-md z-10'>
			{/* Logo */}
			<Link to={"/"} className='flex gap-2 items-center shrink-0'>
				<img src='/spotify.png' className='size-8' alt='Spotify logo' />
				<span className="font-semibold hidden sm:inline">Spotify</span>
			</Link>

			{/* Responsive Search Bar */}
			<form
				onSubmit={handleSearch}
				className="flex items-center gap-2 bg-zinc-700 border border-zinc-700 rounded-2xl px-4 py-2 shadow-md w-full sm:max-w-md"
			>
				<input
					type="text"
					placeholder="Tìm kiếm bài hát, album..."
					value={search}
					onChange={(e) => setSearch(e.target.value)}
					className="outline-none w-full text-sm bg-transparent text-white placeholder:text-gray-400"
				/>
				<button type="submit" className="shrink-0">
					<Search className="text-gray-400 w-5 h-5" />
				</button>
			</form>

			{/* Right Side Controls */}
			<div className='flex items-center justify-end gap-2 sm:gap-4 shrink-0'>
				{isAdmin && (
					<Link
						to={"/admin"}
						className={cn(buttonVariants({ variant: "outline" }), "whitespace-nowrap")}
					>
						<LayoutDashboardIcon className='size-4 mr-2' />
						<span className="hidden sm:inline">Admin Dashboard</span>
					</Link>
				)}

				<SignedOut>
					<SignInOAuthButtons />
				</SignedOut>

				<UserButton />
			</div>
		</div>
	);
};

export default Topbar;
