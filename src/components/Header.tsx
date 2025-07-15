import { ConnectButton } from "@rainbow-me/rainbowkit";
import { FaGithub } from "react-icons/fa";
import Image from "next/image";

export default function Header() {
    return (
        <header className="flex items-center justify-between px-8 py-4 border-b border-gray-200 bg-white">
            <div className="flex items-center gap-4">
                {/* Optional: Add a logo here with <Image /> if you want */}
                <a
                    href="https://github.com/xandev3/tsender" // <-- Replace with your repo URL
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-black text-2xl flex items-center hover:text-gray-700 transition-colors"
                    aria-label="GitHub"
                >
                    <FaGithub />
                </a>
                <span className="font-bold text-black text-xl tracking-wide">tsender</span>
            </div>
            <div>
                <ConnectButton />
            </div>
        </header>
    )
}