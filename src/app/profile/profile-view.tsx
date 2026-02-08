'use client'

import { useState } from 'react'
import Image from 'next/image'
import { LogOut, Map as MapIcon, Star, Users, Settings, Edit3, ChevronDown, ChevronUp } from 'lucide-react'
import ProfileForm from './profile-form'
import Achievements from '@/components/achievements'
import { signOut } from './actions'

interface ProfileViewProps {
    profile: any
    posts: any[]
    commentCount: number
}

export default function ProfileView({ profile, posts, commentCount }: ProfileViewProps) {
    const [isEditing, setIsEditing] = useState(false)

    // Stats
    const postCount = posts.length
    const avgRating = postCount > 0
        ? (posts.reduce((acc, p) => acc + (p.rating_average || 0), 0) / postCount).toFixed(1)
        : '-'

    const stats = [
        { label: 'Sessions', value: postCount.toString(), icon: <MapIcon size={18} /> },
        { label: 'Note Moy.', value: avgRating, icon: <Star size={18} /> },
        { label: 'Amis', value: '0', icon: <Users size={18} /> },
    ]

    return (
        <div className="min-h-screen bg-black text-white pb-32">

            {/* 1. Privacy / Identity Header (Mobile First) */}
            <div className="pt-12 px-6 flex flex-col items-center space-y-4">
                {/* Avatar Ring */}
                <div className="relative">
                    <div className="w-28 h-28 rounded-full border-4 border-gray-800 bg-gray-900 overflow-hidden shadow-2xl">
                        {profile?.avatar_url ? (
                            <Image
                                src={profile.avatar_url}
                                alt={profile.username || 'User'}
                                fill
                                className="object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-4xl">👤</div>
                        )}
                    </div>
                </div>

                {/* Name & Bio */}
                <div className="text-center space-y-1">
                    <h1 className="text-2xl font-black tracking-tight">{profile?.full_name || 'Utilisateur'}</h1>
                    <p className="text-cta font-bold text-sm">@{profile?.username || 'user'}</p>
                </div>

                {/* Edit Toggle */}
                <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-xs font-bold uppercase tracking-wider"
                >
                    <Edit3 size={12} />
                    {isEditing ? 'Fermer' : 'Modifier'}
                </button>
            </div>

            {/* 2. Stats Row (Clean Utility Look) */}
            <div className="mt-8 px-4">
                <div className="grid grid-cols-3 gap-2">
                    {stats.map((stat, i) => (
                        <div key={i} className="bg-gray-900/50 border border-white/5 rounded-2xl p-4 flex flex-col items-center justify-center gap-2">
                            <div className="text-cta">{stat.icon}</div>
                            <span className="text-2xl font-black">{stat.value}</span>
                            <span className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">{stat.label}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* 3. Achievements (Centerpiece) */}
            <div className="mt-8 px-4">
                <Achievements posts={posts} commentCount={commentCount} />
            </div>

            {/* 4. Edit Form (Collapsible) */}
            {isEditing && (
                <div className="mt-8 px-4 animate-in slide-in-from-top-4 duration-300">
                    <div className="bg-gray-900 border border-white/10 rounded-3xl p-6">
                        <h3 className="font-heading text-lg mb-4">Modifier le Profil</h3>
                        <ProfileForm user={profile} />
                    </div>
                </div>
            )}

            {/* 5. Additional / Logout */}
            <div className="mt-12 px-6 flex justify-center">
                <form action={signOut}>
                    <button className="flex items-center gap-2 text-red-500 hover:text-red-400 text-sm font-bold uppercase tracking-widest transition-colors opacity-60 hover:opacity-100">
                        <LogOut size={16} />
                        Déconnexion
                    </button>
                </form>
            </div>
        </div>
    )
}
