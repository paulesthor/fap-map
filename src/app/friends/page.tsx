import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import AddFriends from './add-friends'
import FriendActionButtons from './friend-card-actions'

interface Profile {
    id: string
    username: string
    avatar_url: string | null
    full_name: string | null
}

interface Friendship {
    id: string
    status: 'pending' | 'accepted' | 'blocked'
    user_id: string
    friend_id: string
    requester: Profile
    receiver: Profile
}

export default async function FriendsPage() {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Fetch all friendships involving the current user
    const { data } = await supabase
        .from('friendships')
        .select(`
      id,
      status,
      user_id,
      friend_id,
      requester:profiles!user_id(id, username, avatar_url, full_name),
      receiver:profiles!friend_id(id, username, avatar_url, full_name)
    `)
        .or(`user_id.eq.${user.id},friend_id.eq.${user.id}`)

    const friendships = (data || []) as unknown as Friendship[]

    // Process friendships into categories
    const requests = friendships.filter(f => f.status === 'pending' && f.friend_id === user.id)
    const friends = friendships.filter(f => f.status === 'accepted')

    return (
        <div className="min-h-screen bg-black text-white p-4">
            <div className="max-w-2xl mx-auto space-y-8 pt-4">

                {/* Header */}
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Friends</h1>
                    <Link href="/" className="text-sm text-gray-400 hover:text-white">Back</Link>
                </div>

                {/* Requests Section */}
                {requests.length > 0 && (
                    <section>
                        <h2 className="text-lg font-semibold uppercase tracking-wider mb-4 border-b border-gray-800 pb-2">Requests</h2>
                        <div className="space-y-2">
                            {requests.map((req) => (
                                <div key={req.id} className="flex items-center justify-between bg-gray-900 p-3 rounded-md">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gray-700 overflow-hidden relative">
                                            {/* Requester Avatar */}
                                            {req.requester.avatar_url ? (
                                                <Image
                                                    src={req.requester.avatar_url}
                                                    alt={req.requester.username || 'User'}
                                                    fill
                                                    className="object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-500 text-xs">?</div>
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-bold text-sm">{req.requester.username}</p>
                                            <span className="text-xs text-blue-400">Wants to be friends</span>
                                        </div>
                                    </div>
                                    <FriendActionButtons friendshipId={req.id} type="request" />
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Add Friends Section */}
                <section>
                    <h2 className="text-lg font-semibold uppercase tracking-wider mb-4 border-b border-gray-800 pb-2">Add Friends</h2>
                    <AddFriends />
                </section>

                {/* My Friends List */}
                <section>
                    <h2 className="text-lg font-semibold uppercase tracking-wider mb-4 border-b border-gray-800 pb-2">My Friends ({friends.length})</h2>
                    <div className="grid grid-cols-3 gap-2">
                        {friends.map((friendship) => {
                            // Determine which profile is the "friend" (not me)
                            const isRequester = friendship.user_id === user.id
                            const friendProfile = isRequester ? friendship.receiver : friendship.requester

                            return (
                                <div key={friendship.id} className="bg-gray-900 p-3 rounded-md flex flex-col items-center gap-2">
                                    <div className="w-16 h-16 rounded-full bg-gray-800 overflow-hidden relative">
                                        {friendProfile.avatar_url ? (
                                            <Image
                                                src={friendProfile.avatar_url}
                                                alt={friendProfile.username || 'Friend'}
                                                fill
                                                className="object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-500">?</div>
                                        )}
                                    </div>
                                    <div className="text-center w-full">
                                        <p className="font-bold text-sm truncate w-full px-2" title={friendProfile.username}>{friendProfile.username}</p>
                                        <p className="text-xs text-gray-500 truncate w-full px-2" title={friendProfile.full_name || ''}>{friendProfile.full_name}</p>
                                    </div>
                                    <FriendActionButtons friendshipId={friendship.id} type="friend" />
                                </div>
                            )
                        })}
                    </div>
                    {friends.length === 0 && (
                        <p className="text-gray-500 text-sm">No friends yet. Search above to add some!</p>
                    )}
                </section>

            </div>
        </div>
    )
}
