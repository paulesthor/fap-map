'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { MapPin, User, Star, Clock, EyeOff, Activity, Zap, MessageCircle } from 'lucide-react'
import CommentSheet from './comment-sheet'

interface PostProps {
    post: {
        id: string
        created_at: string
        location: string | null
        caption: string | null
        back_image_url: string
        front_image_url: string
        rating_average: number | null
        rating_isolation: number | null
        rating_location: number | null
        rating_surface: number | null
        rating_brightness: number | null
        duration: number | null
        user: {
            username: string | null
            avatar_url: string | null
        }
    }
}

function timeAgo(dateString: string) {
    const now = new Date()
    const past = new Date(dateString)
    const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000)

    if (diffInSeconds < 60) return `à l'instant`
    const diffInMinutes = Math.floor(diffInSeconds / 60)
    if (diffInMinutes < 60) return `${diffInMinutes} min`
    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) return `${diffInHours}h`
    const diffInDays = Math.floor(diffInHours / 24)
    return `${diffInDays}j`
}

function formatDuration(seconds: number | null) {
    if (!seconds) return null
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60

    if (h > 0) {
        return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
    }
    return `${m}:${s.toString().padStart(2, '0')}`
}

export default function PostCard({ post }: PostProps) {
    const [showComments, setShowComments] = useState(false)
    const [isSwapped, setIsSwapped] = useState(false)

    return (
        <>
            <div className="relative w-full aspect-[4/5] bg-surface rounded-3xl overflow-hidden shadow-2xl border border-white/5 mx-auto max-w-[95%] mb-8">

                {/* Main Image */}
                <Image
                    src={isSwapped ? post.front_image_url : post.back_image_url}
                    alt="Post content"
                    fill
                    className={isSwapped ? "object-cover scale-x-[-1]" : "object-cover"}
                />

                {/* Overlay Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent pointer-events-none" />

                {/* Floating Image (Toggle) */}
                <div
                    onClick={() => setIsSwapped(!isSwapped)}
                    className="absolute top-4 left-4 w-24 aspect-[3/4] rounded-xl overflow-hidden border-2 border-white shadow-lg bg-black rotate-[-6deg] cursor-pointer hover:scale-105 transition-transform z-10"
                >
                    <Image
                        src={isSwapped ? post.back_image_url : post.front_image_url}
                        alt="Secondary view"
                        fill
                        className={isSwapped ? "object-cover" : "object-cover scale-x-[-1]"}
                    />
                </div>

                {/* Rating Badge - Top Right */}
                <div className="absolute top-4 right-4 flex flex-col gap-2 items-end">
                    {post.rating_average && (
                        <div className="bg-black/60 backdrop-blur px-3 py-1 rounded-full border border-white/10 flex items-center gap-1">
                            <Star size={14} strokeWidth={2} className="text-cta fill-cta" />
                            <span className="text-white font-bold font-heading text-lg">{post.rating_average}</span>
                        </div>
                    )}

                    {/* Duration Badge */}
                    {post.duration && post.duration > 0 && (
                        <div className="bg-black/60 backdrop-blur px-3 py-1 rounded-full border border-white/10 flex items-center gap-1">
                            <Clock size={14} strokeWidth={2} className="text-white" />
                            <span className="text-white font-bold font-mono text-xs tracking-wider">{formatDuration(post.duration)}</span>
                        </div>
                    )}
                </div>

                {/* Bottom Content */}
                <div className="absolute bottom-0 left-0 right-0 p-6 space-y-3">

                    {/* User Info */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Link href={`/profile/${post.user.username || ''}`} className="w-10 h-10 rounded-full border-2 border-cta overflow-hidden bg-surface relative">
                                {post.user.avatar_url ? (
                                    <Image src={post.user.avatar_url} alt={post.user.username || 'User'} fill className="object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-text-muted"><User size={20} /></div>
                                )}
                            </Link>
                            <div>
                                <p className="font-heading text-lg leading-none">{post.user.username || 'Inconnu'}</p>
                                <p className="text-[10px] text-text-muted font-bold uppercase tracking-wider flex items-center gap-1">
                                    <MapPin size={16} strokeWidth={2} /> {post.location || 'Lieu Inconnu'} • {timeAgo(post.created_at)}
                                </p>
                            </div>
                        </div>

                        {/* Comment Trigger */}
                        <button
                            onClick={() => setShowComments(true)}
                            className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
                        >
                            <MessageCircle size={24} strokeWidth={2} className="text-white" />
                        </button>
                    </div>

                    {/* Caption */}
                    {post.caption && (
                        <p className="text-sm font-medium leading-snug text-white/90 line-clamp-2">{post.caption}</p>
                    )}

                    {/* Detailed Ratings (Small) */}
                    {post.rating_average && (
                        <div className="flex justify-between pt-2 border-t border-white/10">
                            <div className="flex gap-4 text-[10px] text-text-muted font-bold uppercase tracking-wider w-full justify-between px-2">
                                <span className="flex items-center gap-1"><EyeOff size={16} strokeWidth={2} className="text-white" /> {post.rating_isolation}</span>
                                <span className="flex items-center gap-1"><MapPin size={16} strokeWidth={2} className="text-white" /> {post.rating_location}</span>
                                <span className="flex items-center gap-1"><Activity size={16} strokeWidth={2} className="text-white" /> {post.rating_surface}</span>
                                <span className="flex items-center gap-1"><Zap size={16} strokeWidth={2} className="text-white" /> {post.rating_brightness}</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Comment Sheet Modal */}
            {showComments && (
                <CommentSheet postId={post.id} onClose={() => setShowComments(false)} />
            )}
        </>
    )
}
