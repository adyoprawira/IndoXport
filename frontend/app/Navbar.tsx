"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const navLinks = [
    { href: "/", label: "Home" },
    { href: "/marketplace", label: "Marketplace" },
    { href: "/supplier", label: "Supplier" },
    { href: "/buyers", label: "Buyer" },
    { href: "/exporter", label: "Exporter" },
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
    { href: "/settings", label: "Settings" },
];

export default function Navbar() {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        function handleClick(e: MouseEvent) {
            if (!ref.current) return;
            if (!ref.current.contains(e.target as Node)) setOpen(false);
        }
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, []);

    return (
        <header className="sticky top-0 z-50 bg-white border-b border-gray-100">
            <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-4 py-3">
                <Link href="/" className="flex items-center gap-3">
                    <Image src="/IndoXportLogo.png" alt="IndoXport" width={110} height={28} />
                </Link>

                <nav className="flex flex-1 items-center gap-8 px-4">
                    <div className="hidden gap-6 sm:flex">
                        {navLinks.map((l) => (
                            <Link key={l.href} href={l.href} className="text-sm font-medium text-black hover:text-orange-600">
                                {l.label}
                            </Link>
                        ))}
                    </div>

                    <div className="ml-auto relative" ref={ref}>
                        <button
                            onClick={() => setOpen((v) => !v)}
                            aria-expanded={open}
                            className="inline-flex items-center gap-3 rounded-md border border-orange-500/20 bg-white px-3 py-2 text-sm font-medium text-black hover:bg-orange-50"
                        >
                            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-black text-xs font-semibold text-white">U</span>
                            <span className="text-sm">Profile</span>
                        </button>

                        {open && (
                            <div className="absolute right-0 mt-2 w-44 rounded-md border border-gray-100 bg-white shadow-md">
                                <ul className="p-2">
                                    <li>
                                        <Link href="/user-profile" className="block rounded-md px-3 py-2 text-sm text-black hover:bg-orange-50">
                                            My Profile
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href="/settings" className="block rounded-md px-3 py-2 text-sm text-black hover:bg-orange-50">
                                            Settings
                                        </Link>
                                    </li>
                                    <li>
                                        <a href="#" className="block rounded-md px-3 py-2 text-sm text-black hover:bg-orange-50">
                                            Logout
                                        </a>
                                    </li>
                                </ul>
                            </div>
                        )}
                    </div>
                </nav>
            </div>
        </header>
    );
}