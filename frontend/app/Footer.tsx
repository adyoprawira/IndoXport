"use client";

import Image from "next/image";
import Link from "next/link";

export default function Footer() {
	return (
		<footer className="border-t border-gray-100 bg-white">
			<div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-4 py-8 sm:flex-row sm:justify-between">
				<div className="flex items-center">
					<Link href="/" className="inline-flex items-center">
						<Image src="/IndoXportLogo.png" alt="IndoXport" width={96} height={96} className="object-contain" />
					</Link>
				</div>

				<div className="flex items-center gap-6">
					<div className="flex gap-4">
						<Link href="/about" className="text-sm text-black hover:text-orange-600">About</Link>
						<Link href="/terms" className="text-sm text-black hover:text-orange-600">Terms</Link>
						<Link href="/privacy" className="text-sm text-black hover:text-orange-600">Privacy</Link>
					</div>
					<div className="text-sm text-zinc-600">&copy; {new Date().getFullYear()} IndoXport</div>
				</div>
			</div>
		</footer>
	);
}

