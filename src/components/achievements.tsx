'use client'

import { useMemo, useState, useEffect } from 'react'

import { Trophy, Star, Zap, Clock, Calendar, MapPin, Camera, MessageCircle, Flame, TrendingUp, Moon, Sun, Coffee, Sunset, Activity, Medal, Award, Crown } from 'lucide-react'

interface Achievement {
    id: string
    title: string
    description: string
    icon: React.ReactNode
    unlocked: boolean
    category: 'volume' | 'streak' | 'timing' | 'duration' | 'rating' | 'social'
}

interface AchievementsProps {
    posts: any[]
    commentCount: number
}

export default function Achievements({ posts, commentCount }: AchievementsProps) {
    const trophies: Achievement[] = []

    // --- Helpers ---
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const { currentStreak } = useMemo(() => {
        const pDates = posts
            .map(p => new Date(p.created_at).toISOString().split('T')[0])
            .filter((value, index, self) => self.indexOf(value) === index)
            .sort((a, b) => b.localeCompare(a))

        let streak = 0
        if (pDates.length > 0) {
            const today = new Date().toISOString().split('T')[0]
            const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]

            if (pDates[0] === today || pDates[0] === yesterday) {
                streak = 1
                for (let i = 0; i < pDates.length - 1; i++) {
                    const d1 = new Date(pDates[i])
                    const d2 = new Date(pDates[i + 1])
                    const diffTime = Math.abs(d1.getTime() - d2.getTime())
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
                    if (diffDays === 1) {
                        streak++
                    } else {
                        break
                    }
                }
            }
        }
        return { currentStreak: streak }
    }, [posts])

    // --- 1. Volume ---
    const count = posts.length
    trophies.push(
        { id: 'vol_1', title: 'Débutant', description: 'Premier post publié', icon: <Medal size={20} />, unlocked: count >= 1, category: 'volume' },
        { id: 'vol_5', title: 'Novice', description: '5 sessions enregistrées', icon: <Medal size={20} />, unlocked: count >= 5, category: 'volume' },
        { id: 'vol_10', title: 'Habitué', description: '10 sessions enregistrées', icon: <Award size={20} />, unlocked: count >= 10, category: 'volume' },
        { id: 'vol_25', title: 'Confirmé', description: '25 sessions au compteur', icon: <Award size={20} />, unlocked: count >= 25, category: 'volume' },
        { id: 'vol_50', title: 'Accroc', description: '50 sessions !', icon: <Trophy size={20} />, unlocked: count >= 50, category: 'volume' },
        { id: 'vol_100', title: 'Légende', description: '100 sessions. Incroyable.', icon: <Crown size={20} />, unlocked: count >= 100, category: 'volume' }
    )

    // --- 2. Streaks ---
    trophies.push(
        { id: 'str_2', title: 'Double Tap', description: '2 jours de suite', icon: <Flame size={20} />, unlocked: currentStreak >= 2, category: 'streak' },
        { id: 'str_3', title: 'Chauffage', description: '3 jours de suite', icon: <Flame size={20} />, unlocked: currentStreak >= 3, category: 'streak' },
        { id: 'str_7', title: 'Semaine de Feu', description: '7 jours de suite', icon: <TrendingUp size={20} />, unlocked: currentStreak >= 7, category: 'streak' },
        { id: 'str_14', title: 'Dévoué', description: '2 semaines complètes', icon: <TrendingUp size={20} />, unlocked: currentStreak >= 14, category: 'streak' },
        { id: 'str_30', title: 'Mois Complet', description: '30 jours sans pause', icon: <Calendar size={20} />, unlocked: currentStreak >= 30, category: 'streak' }
    )

    // --- 3. Timing ---
    const hasPostInHourRange = (start: number, end: number) => posts.some(p => {
        const h = new Date(p.created_at).getHours()
        return h >= start && h < end
    })

    trophies.push(
        { id: 'time_early', title: 'Lève-tôt', description: 'Post entre 5h et 9h', icon: <Sun size={20} />, unlocked: hasPostInHourRange(5, 9), category: 'timing' },
        { id: 'time_lunch', title: 'Pause Déj', description: 'Post entre 12h et 14h', icon: <Coffee size={20} />, unlocked: hasPostInHourRange(12, 14), category: 'timing' },
        { id: 'time_after', title: 'After Work', description: 'Post entre 17h et 20h', icon: <Sunset size={20} />, unlocked: hasPostInHourRange(17, 20), category: 'timing' },
        { id: 'time_night', title: 'Oiseau de Nuit', description: 'Post entre 2h et 5h', icon: <Moon size={20} />, unlocked: hasPostInHourRange(2, 5), category: 'timing' }
    )

    // --- 4. Duration ---
    const hasDuration = (minSeconds: number, maxSeconds?: number) => posts.some(p => {
        const d = p.duration || 0
        if (maxSeconds) return d >= minSeconds && d <= maxSeconds
        return d >= minSeconds
    })

    trophies.push(
        { id: 'dur_flash', title: "L'Éclair", description: 'Session de moins de 2 min', icon: <Zap size={20} />, unlocked: hasDuration(1, 120), category: 'duration' },
        { id: 'dur_std', title: 'Session Standard', description: 'Entre 10 et 20 min', icon: <Clock size={20} />, unlocked: hasDuration(600, 1200), category: 'duration' },
        { id: 'dur_long', title: 'Longue Séance', description: 'Plus de 30 min', icon: <Activity size={20} />, unlocked: hasDuration(1800), category: 'duration' },
        { id: 'dur_mara', title: 'Marathon', description: 'Plus de 45 min', icon: <Activity size={20} />, unlocked: hasDuration(2700), category: 'duration' },
        { id: 'dur_endure', title: 'Endurance', description: 'Plus de 1 heure', icon: <Activity size={20} />, unlocked: hasDuration(3600), category: 'duration' }
    )

    // --- 5. Ratings ---
    const hasRating = (min: number, max?: number) => posts.some(p => {
        const r = p.rating_average || 0
        if (max) return r >= min && r <= max
        return r >= min
    })

    trophies.push(
        { id: 'rate_avg', title: 'Dans la Moyenne', description: 'Note entre 2.5 et 3.5', icon: <Star size={20} />, unlocked: hasRating(2.5, 3.5), category: 'rating' },
        { id: 'rate_good', title: 'Bonne Session', description: 'Note supérieure à 4.0', icon: <Star size={20} />, unlocked: hasRating(4.0), category: 'rating' },
        { id: 'rate_perf', title: 'Perfectionniste', description: 'Note parfaite de 5.0', icon: <Star size={20} />, unlocked: hasRating(5.0, 5.0), category: 'rating' }
    )

    // --- 6. Social & Feature ---
    const differentLocations = new Set(posts.map(p => p.location).filter(Boolean)).size

    trophies.push(
        { id: 'feat_photo', title: 'Photographe', description: 'A utilisé les 2 caméras', icon: <Camera size={20} />, unlocked: count > 0, category: 'social' }, // Implicit in app flow
        { id: 'feat_place', title: 'Cartographe', description: 'A nommé un lieu personnalisé', icon: <MapPin size={20} />, unlocked: differentLocations >= 1, category: 'social' },
        { id: 'feat_explore', title: 'Explorateur', description: '5 lieux différents', icon: <MapPin size={20} />, unlocked: differentLocations >= 5, category: 'social' },
        { id: 'feat_comment', title: 'Critique', description: 'A laissé un commentaire', icon: <MessageCircle size={20} />, unlocked: commentCount > 0, category: 'social' }
    )

    // --- UI State ---
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const [isExpanded, setIsExpanded] = useState(false)
    const [newUnlock, setNewUnlock] = useState<Achievement | null>(null)

    // --- Effect: Check for new unlocks ---
    useEffect(() => {
        // Get unlocked IDs
        const currentUnlockedIds = trophies.filter(t => t.unlocked).map(t => t.id)

        // Load stored unlocks
        const stored = localStorage.getItem('fapmap_achievements')
        const previousUnlockedIds: string[] = stored ? JSON.parse(stored) : []

        // Find new ones
        const newlyUnlockedIds = currentUnlockedIds.filter(id => !previousUnlockedIds.includes(id))

        if (newlyUnlockedIds.length > 0) {
            // Find the full achievement object for the first new one (to show toast)
            const firstNew = trophies.find(t => t.id === newlyUnlockedIds[0])
            if (firstNew) {
                setNewUnlock(firstNew)
                // Auto-hide toast after 4s
                setTimeout(() => setNewUnlock(null), 4000)
            }

            // Update storage
            localStorage.setItem('fapmap_achievements', JSON.stringify(currentUnlockedIds))
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [posts, commentCount]) // Re-run when data changes

    // --- UI Render ---
    const unlockedCount = trophies.filter(t => t.unlocked).length
    const progress = Math.round((unlockedCount / trophies.length) * 100)

    return (
        <div className="space-y-6 relative">

            {/* Toast Notification (Fixed at Top) */}
            {newUnlock && (
                <div className="fixed top-4 left-4 right-4 z-50 animate-in slide-in-from-top duration-500">
                    <div className="bg-cta text-white p-4 rounded-2xl shadow-2xl flex items-center gap-4 border-2 border-white/20 backdrop-blur-md">
                        <div className="p-2 bg-white/20 rounded-full animate-bounce">
                            <Trophy size={24} className="text-yellow-300" fill="currentColor" />
                        </div>
                        <div className="flex-1">
                            <h4 className="font-bold text-lg uppercase tracking-wider">Trophée Débloqué !</h4>
                            <p className="font-medium text-white/90">{newUnlock.title}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Header / Summary */}
            <div className="bg-surface/50 border border-white/5 rounded-2xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-cta/10 text-cta rounded-full flex items-center justify-center">
                        <Trophy size={24} />
                    </div>
                    <div>
                        <h3 className="font-heading text-lg">Trophées</h3>
                        <p className="text-xs text-text-muted font-bold uppercase tracking-wider">
                            {unlockedCount} / {trophies.length} Débloqués ({progress}%)
                        </p>
                    </div>
                </div>

                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-xs font-bold uppercase transition-colors"
                >
                    {isExpanded ? 'Masquer' : 'Voir tout'}
                </button>
            </div>

            {/* Grid (Collapsible) */}
            {isExpanded && (
                <div className="grid grid-cols-4 gap-2 md:grid-cols-5 lg:grid-cols-6 animate-in fade-in slide-in-from-top-4 duration-300">
                    {trophies.map((trophy) => (
                        <div
                            key={trophy.id}
                            className={`aspect-square flex flex-col items-center justify-center p-2 rounded-xl border transition-all ${trophy.unlocked
                                ? 'bg-surface border-cta/30 text-cta shadow-[0_0_15px_-5px_var(--color-cta)]'
                                : 'bg-surface/50 border-white/5 text-text-muted opacity-50 grayscale'
                                }`}
                            title={!trophy.unlocked ? `${trophy.title}: ${trophy.description}` : trophy.title}
                        >
                            <div className="mb-1">{trophy.icon}</div>
                            <span className="text-[9px] font-bold uppercase text-center leading-tight line-clamp-2">
                                {trophy.title}
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
