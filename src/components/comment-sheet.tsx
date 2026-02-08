'use client'

import { useState, useEffect, useRef } from 'react'
import { Send } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { addComment, getComments } from '@/app/actions/comments'
import { createClient } from '@/utils/supabase/client'

interface Comment {
    id: string
    content: string
    created_at: string
    user: {
        username: string
        avatar_url: string | null
    }
}

interface CommentSheetProps {
    postId: string
    onClose: () => void
}

export default function CommentSheet({ postId, onClose }: CommentSheetProps) {
    const [comments, setComments] = useState<Comment[]>([])
    const [newComment, setNewComment] = useState('')
    const [loading, setLoading] = useState(true)
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const supabase = createClient()

    const scrollToBottom = () => {
        setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
        }, 100)
    }

    useEffect(() => {
        // Initial fetch
        const fetchComments = async () => {
            const data = await getComments(postId)
            if (data) {
                setComments(data as unknown as Comment[])
            }
            setLoading(false)
            scrollToBottom()
        }

        fetchComments()

        // Realtime subscription
        const channel = supabase
            .channel(`comments-${postId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'comments',
                    filter: `post_id=eq.${postId}`
                },
                async (payload) => {
                    // Fetch the full comment with user data (since payload only has raw data)
                    const { data } = await supabase
                        .from('comments')
                        .select(`
                            id,
                            content,
                            created_at,
                            user:profiles(username, avatar_url)
                        `)
                        .eq('id', payload.new.id)
                        .single()

                    if (data) {
                        setComments((prev) => [...prev, data as unknown as Comment])
                        scrollToBottom()
                    }
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [postId, supabase])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newComment.trim()) return

        try {
            await addComment(postId, newComment)
            setNewComment('')

            // Manual re-fetch to ensure UI updates immediately (fallback for realtime)
            const updatedComments = await getComments(postId)
            if (updatedComments) {
                setComments(updatedComments as unknown as Comment[])
                scrollToBottom()
            }
        } catch (error) {
            console.error('Failed to post comment', error)
        }
    }

    return (
        <div className="fixed inset-0 z-40 flex items-end justify-center pointer-events-none">
            {/* Backdrop - Click to close */}
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200 pointer-events-auto" onClick={onClose} />

            {/* Sheet Container - Pushed up by margin to show Bottom Nav */}
            <div className="w-full max-w-md bg-[#0F172A] h-[50vh] rounded-t-[2rem] border-t border-white/5 flex flex-col shadow-2xl animate-in slide-in-from-bottom duration-300 relative z-10 pointer-events-auto mb-[85px] mx-2 rounded-b-[2rem]">

                {/* Grabber Bar */}
                <div className="w-full flex justify-center pt-3 pb-1" onClick={onClose}>
                    <div className="w-12 h-1.5 bg-white/20 rounded-full" />
                </div>

                {/* Header */}
                <div className="flex justify-center items-center p-3 border-b border-white/5 mx-4">
                    <h3 className="font-heading text-xs tracking-widest uppercase text-white/50">Commentaires</h3>
                </div>

                {/* Comments List */}
                <div className="flex-1 overflow-y-auto p-4 space-y-5 scrollbar-hide">
                    {loading ? (
                        <div className="flex justify-center py-8">
                            <span className="animate-spin text-2xl opacity-50">⏳</span>
                        </div>
                    ) : comments.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-8 text-center space-y-2 opacity-60">
                            <span className="text-3xl">💭</span>
                            <p className="text-sm font-medium">Aucun commentaire</p>
                        </div>
                    ) : (
                        comments.map((comment) => (
                            <div key={comment.id} className="flex gap-3 group">
                                <Link href={`/profile/${comment.user.username}`} onClick={onClose}>
                                    <div className="w-8 h-8 rounded-full bg-surface border border-white/10 overflow-hidden shrink-0 relative">
                                        {comment.user.avatar_url ? (
                                            <Image src={comment.user.avatar_url} alt={comment.user.username} fill className="object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-xs bg-white/5">?</div>
                                        )}
                                    </div>
                                </Link>
                                <div className="flex-1 space-y-0.5">
                                    <div className="flex items-baseline gap-2">
                                        <span className="font-bold text-sm text-white">{comment.user.username}</span>
                                        <span className="text-[10px] text-white/40">{new Date(comment.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>
                                    <p className="text-sm text-gray-300 leading-relaxed font-light">{comment.content}</p>
                                </div>
                            </div>
                        ))
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-3 bg-[#0F172A] border-t border-white/5 rounded-b-[2rem]">
                    <form onSubmit={handleSubmit} className="flex items-end gap-2">
                        <div className="relative flex-1">
                            <input
                                type="text"
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                placeholder="Ajouter un commentaire..."
                                className="w-full bg-surface/50 border border-white/10 text-white placeholder:text-white/20 rounded-xl py-2.5 pl-4 pr-10 text-sm focus:outline-none focus:border-cta/50 focus:bg-surface transition-all"
                            />
                            <button
                                type="submit"
                                disabled={!newComment.trim()}
                                className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 bg-cta text-white rounded-lg disabled:opacity-0 disabled:scale-75 transition-all hover:scale-105 active:scale-95"
                            >
                                <Send size={14} strokeWidth={2.5} />
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}
