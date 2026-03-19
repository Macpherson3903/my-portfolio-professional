import Image from "next/image";
import Link from "next/link";
import NavBar from "@/components/NavBar";

export default function Header() {
    return (
        <header className="sticky top-0 z-50 w-full backdrop-blur-md bg-linear-to-r from-gray-950/90 via-black/80 to-red-900/90 border-b border-white/5 md:p-3">
            <div className="w-full max-w-7xl mx-auto px-5 py-3 flex justify-between items-center">

                <Link href="/" className="flex items-center gap-4 group">
                    <Image
                        width={50}
                        height={50}
                        src="/assets/profile-img.png"
                        alt="profile Image of Macpherson"
                        className="rounded-full inset-shadow-sm inset-shadow-red-500/50 cursor-pointer ring-1 ring-white/10 group-hover:ring-red-500/40 transition"
                        priority
                    />
                    <h3 className="text-gray-300 font-mono font-bold uppercase text-xl tracking-wide group-hover:text-white transition">
                        Macpherson
                    </h3>
                </Link>

                <NavBar />
            </div>
        </header>
    );
}