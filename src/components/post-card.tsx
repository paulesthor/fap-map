'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { MapPin, User, Star, Clock, EyeOff, Activity, Zap, MessageCircle, Heart } from 'lucide-react'
import CommentSheet from './comment-sheet'
import { toggleLike } from '@/app/actions'

interface PostProps {
    post: {
        id: string
        user_id: string
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
        likes_count?: number
        user_has_liked?: boolean
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

    // Optimistic UI for likes
    const [liked, setLiked] = useState(post.user_has_liked || false)
    const [likeCount, setLikeCount] = useState(post.likes_count || 0)
    const [isAnimatingLike, setIsAnimatingLike] = useState(false)
    const lastTapTime = useRef(0)

    const handleLike = async () => {
        // Optimistic update
        const newLiked = !liked
        setLiked(newLiked)
        setLikeCount(prev => newLiked ? prev + 1 : prev - 1)

        if (newLiked) {
            triggerLikeAnimation()
        }

        // Server action
        await toggleLike(post.id)
    }

    const triggerLikeAnimation = () => {
        setIsAnimatingLike(true)
        setTimeout(() => setIsAnimatingLike(false), 800)
    }

    const handleDoubleTap = (e: React.MouseEvent) => {
        const currentTime = new Date().getTime()
        const tapLength = currentTime - lastTapTime.current

        if (tapLength < 300 && tapLength > 0) {
            // Double tap detected
            if (!liked) {
                handleLike()
            } else {
                triggerLikeAnimation() // Just show animation if already liked
            }
        } else {
            // Single tap logic (swap image)
            // We can use a timeout to distinguish, but for now let's keep it simple: 
            // If double tap doesn't happen, we might swap. 
            // Ideally we separate the swap button to avoid conflict or use long press.
            // But user requested "press rapidly twice on photo".
            // The swap is currently on the floating image, let's keep main image tap for likes/swap
        }
        lastTapTime.current = currentTime
    }

    // Handlers for main image click (Double tap for like, or swap?)
    // Let's make main image CLICK swap, but DOUBLE CLICK like?
    // Or keep swap button separate? 
    // The previous code had floating image as toggle swap. Main image didn't have click handler.
    // So we can safely add double tap to main image. 

    return (
        <>
            <div className="relative w-full aspect-[4/5] bg-surface rounded-3xl overflow-hidden shadow-2xl border border-white/5 mx-auto max-w-[95%] mb-8">

                {/* Main Image Container */}
                <div
                    className="relative w-full h-full"
                    onClick={handleDoubleTap}
                >
                    <Image
                        src={isSwapped ? post.front_image_url : post.back_image_url}
                        alt="Post content"
                        fill
                        className={isSwapped ? "object-cover scale-x-[-1]" : "object-cover"}
                    />

                    {/* Like Animation Overlay */}
                    {isAnimatingLike && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20 animate-in zoom-in-50 duration-300 fade-out-0 fill-mode-forwards">
                            <Heart size={100} className="fill-white text-white drop-shadow-2xl" />
                        </div>
                    )}
                </div>

                {/* Overlay Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent pointer-events-none" />

                {/* Floating Image (Toggle) */}
                <div
                    onClick={(e) => { e.stopPropagation(); setIsSwapped(!isSwapped); }}
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

                    {/* Actions Row (Like & Comment) - NEW */}
                    <div className="flex items-center gap-4 mb-2">
                        <button
                            onClick={handleLike}
                            className="group flex items-center gap-2"
                        >
                            <Heart
                                size={28}
                                strokeWidth={2}
                                className={`transition-all ${liked ? 'fill-cta text-cta scale-110' : 'text-white group-hover:scale-110'}`}
                            />
                            {likeCount > 0 && (
                                <span className="text-white font-bold text-sm tracking-wide">{likeCount}</span>
                            )}
                        </button>

                        <button
                            onClick={() => setShowComments(true)}
                            className="group flex items-center gap-2"
                        >
                            <MessageCircle size={28} strokeWidth={2} className="text-white group-hover:scale-110 transition-transform" />
                        </button>
                    </div>

                    {/* User Info */}
                    <div className="flex items-center gap-3">
                        <Link href={`/profile/${post.user_id}`} className="w-8 h-8 rounded-full border border-white/20 overflow-hidden bg-surface relative">
                            {post.user.avatar_url ? (
                                <Image src={post.user.avatar_url} alt={post.user.username || 'User'} fill className="object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-text-muted"><User size={14} /></div>
                            )}
                        </Link>
                        <div>
                            <p className="font-heading text-base leading-none">
                                {post.user.username || 'Inconnu'}
                                <span className="text-text-muted font-normal text-xs ml-2">
                                    • {timeAgo(post.created_at)}
                                </span>
                            </p>
                            <p className="text-[10px] text-text-muted flex items-center gap-1 mt-0.5">
                                <MapPin size={12} strokeWidth={2} /> {post.location || 'Lieu Inconnu'}
                            </p>
                        </div>
                    </div>

                    {/* Caption */}
                    {post.caption && (
                        <p className="text-sm font-medium leading-snug text-white/90 line-clamp-2">{post.caption}</p>
                    )}

                    {/* Detailed Ratings (Small) */}
                    {post.rating_average && (
                        <div className="flex justify-between pt-2 border-t border-white/10 opacity-60">
                            <div className="flex gap-4 text-[10px] text-text-muted font-bold uppercase tracking-wider w-full justify-between px-2">
                                <span className="flex items-center gap-1"><EyeOff size={14} strokeWidth={2} className="text-white" /> {post.rating_isolation}</span>
                                <span className="flex items-center gap-1"><MapPin size={14} strokeWidth={2} className="text-white" /> {post.rating_location}</span>
                                <span className="flex items-center gap-1"><Activity size={14} strokeWidth={2} className="text-white" /> {post.rating_surface}</span>
                                <span className="flex items-center gap-1"><Zap size={14} strokeWidth={2} className="text-white" /> {post.rating_brightness}</span>
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
