'use client'

import { acceptFriendRequest, deleteFriendship } from './actions'
import { useState } from 'react'

interface ActionButtonsProps {
    friendshipId: string
    type: 'request' | 'friend'
}

export default function FriendActionButtons({ friendshipId, type }: ActionButtonsProps) {
    const [loading, setLoading] = useState(false)

    const handleAccept = async () => {
        setLoading(true)
        await acceptFriendRequest(friendshipId)
        setLoading(false)
    }

    const handleRemove = async () => {
        if (!confirm('Are you sure?')) return
        setLoading(true)
        await deleteFriendship(friendshipId)
        setLoading(false)
    }

    if (loading) {
        return <span className="text-xs text-gray-500">Processing...</span>
    }

    if (type === 'request') {
        return (
            <div className="flex gap-2">
                <button
                    onClick={handleAccept}
                    className="text-xs bg-white text-black px-3 py-1 rounded-full font-bold hover:bg-gray-200"
                >
                    Accept
                </button>
                <button
                    onClick={handleRemove}
                    className="text-xs bg-gray-800 text-gray-400 px-3 py-1 rounded-full hover:bg-gray-700"
                >
                    Ignore
                </button>
            </div>
        )
    }

    return (
        <button
            onClick={handleRemove}
            className="w-full text-[10px] text-red-500 hover:bg-gray-800 py-1 rounded transition-colors"
        >
            Remove
        </button>
    )
}
