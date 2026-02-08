'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Map as MapIcon, Plus, Users, User } from 'lucide-react'

export default function BottomNav() {
    const pathname = usePathname()

    const isActive = (path: string) => pathname === path

    return (
        <nav className="fixed bottom-0 left-0 right-0 h-16 bg-surface/90 backdrop-blur border-t border-white/10 flex justify-around items-center z-50 pb-safe">
            <Link href="/" className={`flex flex-col items-center gap-1 p-2 ${isActive('/') ? 'text-cta' : 'text-text-muted hover:text-white'}`}>
                <Home size={24} strokeWidth={isActive('/') ? 3 : 2} />
                <span className="text-[10px] font-bold uppercase tracking-wider">Feed</span>
            </Link>

            <Link href="/map" className={`flex flex-col items-center gap-1 p-2 ${isActive('/map') ? 'text-cta' : 'text-text-muted hover:text-white'}`}>
                <MapIcon size={24} strokeWidth={isActive('/map') ? 3 : 2} />
                <span className="text-[10px] font-bold uppercase tracking-wider">Carte</span>
            </Link>

            <Link href="/post" className="relative -top-5">
                <div className="w-16 h-16 rounded-full bg-cta text-white flex items-center justify-center shadow-lg border-4 border-background transform transition-transform active:scale-95">
                    <Plus size={32} strokeWidth={3} />
                </div>
            </Link>

            <Link href="/friends" className={`flex flex-col items-center gap-1 p-2 ${isActive('/friends') ? 'text-cta' : 'text-text-muted hover:text-white'}`}>
                <Users size={24} strokeWidth={isActive('/friends') ? 3 : 2} />
                <span className="text-[10px] font-bold uppercase tracking-wider">Amis</span>
            </Link>

            <Link href="/profile" className={`flex flex-col items-center gap-1 p-2 ${isActive('/profile') ? 'text-cta' : 'text-text-muted hover:text-white'}`}>
                <User size={24} strokeWidth={isActive('/profile') ? 3 : 2} />
                <span className="text-[10px] font-bold uppercase tracking-wider">Profil</span>
            </Link>
        </nav>
    )
}
