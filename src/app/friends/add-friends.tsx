'use client'

import { searchUsers, sendFriendRequest } from './actions'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import QRScanner from '@/components/qr-code-scanner'
import QRCodeDisplay from '@/components/qr-code-display'
import { createClient } from '@/utils/supabase/client'

interface UserPreview {
    id: string
    username: string
    full_name: string
    avatar_url: string
}

export default function AddFriends() {
    const [mode, setMode] = useState<'search' | 'scan'>('search')
    const [results, setResults] = useState<UserPreview[]>([])
    const [searching, setSearching] = useState(false)
    const [myId, setMyId] = useState<string | null>(null)

    useEffect(() => {
        const fetchUser = async () => {
            const supabase = createClient()
            const { data } = await supabase.auth.getUser()
            if (data.user) setMyId(data.user.id)
        }
        fetchUser()
    }, [])


    const handleSearch = async (formData: FormData) => {
        setSearching(true)
        const res = await searchUsers(formData)
        setResults(res.users || [])
        setSearching(false)
    }

    const handleAdd = async (id: string, name?: string) => {
        if (confirm(`Envoyer une demande à ${name || 'cet ami'} ?`)) {
            const res = await sendFriendRequest(id)
            if (res.error) alert(res.error)
            else alert('Demande envoyée !')
        }
    }

    const handleScan = async (data: string) => {
        // Format expected: "fapmap:friend:USER_ID"
        if (data.startsWith('fapmap:friend:')) {
            const friendId = data.split(':')[2]
            if (friendId === myId) {
                alert("Vous ne pouvez pas vous ajouter vous-même !")
                return
            }
            await handleAdd(friendId, "cet ami mystère")
        } else {
            // Try as raw ID if UUID length
            if (data.length > 30) {
                await handleAdd(data)
            } else {
                alert("Code QR non reconnu : " + data)
            }
        }
    }

    return (
        <div className="space-y-4">
            {/* Mode Toggle */}
            <div className="flex p-1 bg-gray-900 rounded-lg">
                <button
                    onClick={() => setMode('search')}
                    className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${mode === 'search' ? 'bg-gray-700 text-white shadow' : 'text-gray-500 hover:text-white'}`}
                >
                    🔍 Recherche
                </button>
                <button
                    onClick={() => setMode('scan')}
                    className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${mode === 'scan' ? 'bg-cta text-white shadow' : 'text-gray-500 hover:text-white'}`}
                >
                    📷 Scan & Code
                </button>
            </div>

            {mode === 'search' ? (
                <>
                    <form action={handleSearch} className="flex gap-2">
                        <input
                            name="query"
                            type="text"
                            placeholder="Chercher un pseudo..."
                            className="flex-1 rounded-md bg-gray-800 border-none text-white p-2 focus:ring-1 focus:ring-cta"
                        />
                        <button
                            type="submit"
                            disabled={searching}
                            className="bg-white text-black px-4 py-2 rounded-md font-bold disabled:opacity-50 hover:bg-gray-200"
                        >
                            {searching ? '...' : 'Go'}
                        </button>
                    </form>

                    <div className="space-y-2">
                        {results.map((user) => (
                            <div key={user.id} className="flex items-center justify-between bg-gray-900 p-3 rounded-md">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gray-700 overflow-hidden relative">
                                        {user.avatar_url ? (
                                            <Image src={user.avatar_url} alt={user.username} fill className="object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-500 text-xs">?</div>
                                        )}
                                    </div>
                                    <div>
                                        <p className="font-bold text-sm">{user.username}</p>
                                        <p className="text-xs text-gray-400">{user.full_name}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleAdd(user.id, user.username)}
                                    className="text-xs bg-gray-800 hover:bg-gray-700 text-white px-3 py-1 rounded-full uppercase font-semibold tracking-wider border border-gray-700"
                                >
                                    Ajouter
                                </button>
                            </div>
                        ))}
                        {results.length === 0 && !searching && (
                            <p className="text-center text-gray-500 text-sm py-4">Recherchez un ami pour l'ajouter.</p>
                        )}
                    </div>
                </>
            ) : (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <section className="space-y-2 text-center">
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Scanner un ami</h3>
                        <QRScanner onScan={handleScan} />
                    </section>

                    <div className="w-full h-px bg-gray-800" />

                    <section className="space-y-2 text-center">
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Mon Code</h3>
                        <div className="flex justify-center">
                            {myId ? (
                                <QRCodeDisplay value={`fapmap:friend:${myId}`} />
                            ) : (
                                <div className="w-64 h-64 bg-gray-800 animate-pulse rounded-xl" />
                            )}
                        </div>
                        <p className="text-xs text-gray-500">Montrez ce code à un ami pour qu'il vous ajoute.</p>
                    </section>
                </div>
            )}
        </div>
    )
}
