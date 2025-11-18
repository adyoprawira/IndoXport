"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

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
    const router = useRouter();
    const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8000";

    const [profile, setProfile] = useState<any>(null);
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

    useEffect(() => {
        // quick local cache for immediate UX
        if (typeof window !== "undefined") {
            const stored = localStorage.getItem("auth_user");
            if (stored) {
                try {
                    setProfile(JSON.parse(stored));
                } catch {}
            }
        }

        // fetch canonical profile (merge with stored)
        let mounted = true;
        fetch(`${BACKEND_URL}/api/auth/profile/`)
            .then((r) => {
                if (!r.ok) throw new Error("no profile");
                return r.json();
            })
            .then((data) => {
                if (!mounted) return;
                const merged = { ...(typeof window !== "undefined" && localStorage.getItem("auth_user") ? JSON.parse(localStorage.getItem("auth_user") as string) : {}), ...(data.user || {}) };
                setProfile(merged);
            })
            .catch(() => {})
            .finally(() => {
                /* noop */
            });

        return () => {
            mounted = false;
        };
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
                        {profile ? (
                            <button
                                onClick={() => setOpen((v) => !v)}
                                aria-expanded={open}
                                className="inline-flex items-center gap-3 rounded-md border border-orange-500/20 bg-white px-3 py-2 text-sm font-medium text-black hover:bg-orange-50"
                            >
                                {profile.photoUrl ? (
                                    <Image src={profile.photoUrl} alt="avatar" width={28} height={28} className="rounded-full" />
                                ) : (
                                    <div className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-black text-xs font-semibold text-white">
                                        {String((profile.full_name || profile.name || profile.username || "U").charAt(0)).toUpperCase()}
                                    </div>
                                )}
                                <span className="text-sm">Hi, {profile.full_name || profile.name || profile.username}!</span>
                            </button>
                        ) : (
                            <Link href="/login" className="inline-flex items-center gap-3 rounded-md border border-orange-500/20 bg-white px-3 py-2 text-sm font-medium text-black hover:bg-orange-50">
                                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-black text-xs font-semibold text-white">L</span>
                                <span className="text-sm">Login</span>
                            </Link>
                        )}

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
                                        {profile ? (
                                            <button
                                                onClick={() => {
                                                    if (typeof window !== "undefined") localStorage.removeItem("auth_user");
                                                    setProfile(null);
                                                    setOpen(false);
                                                    router.push("/login");
                                                }}
                                                className="w-full text-left rounded-md px-3 py-2 text-sm text-black hover:bg-orange-50"
                                            >
                                                Logout
                                            </button>
                                        ) : (
                                            <Link href="/login" className="block rounded-md px-3 py-2 text-sm text-black hover:bg-orange-50">Login</Link>
                                        )}
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