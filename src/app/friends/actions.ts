'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function searchUsers(formData: FormData) {
    const supabase = await createClient()
    const query = formData.get('query') as string

    if (!query || query.length < 3) {
        return { users: [] }
    }

    const { data: users, error } = await supabase
        .from('profiles')
        .select('id, username, full_name, avatar_url')
        .ilike('username', `%${query}%`)
        .limit(10)

    if (error) {
        console.error('Error searching users:', error)
        return { users: [] }
    }

    return { users }
}

export async function sendFriendRequest(friendId: string) {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) return { error: 'Not authenticated' }

    // Check if request already exists (in either direction)
    const { data: existing } = await supabase
        .from('friendships')
        .select('*')
        .or(`and(user_id.eq.${user.id},friend_id.eq.${friendId}),and(user_id.eq.${friendId},friend_id.eq.${user.id})`)
        .single()

    if (existing) {
        return { error: 'Friendship or request already exists' }
    }

    const { error } = await supabase.from('friendships').insert({
        user_id: user.id,
        friend_id: friendId,
        status: 'pending',
    })

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/friends')
    return { message: 'Request sent!' }
}

export async function acceptFriendRequest(friendshipId: string) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('friendships')
        .update({ status: 'accepted' })
        .eq('id', friendshipId)

    if (error) return { error: error.message }

    revalidatePath('/friends')
    return { message: 'Friend accepted!' }
}

export async function deleteFriendship(friendshipId: string) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('friendships')
        .delete()
        .eq('id', friendshipId)

    if (error) return { error: error.message }

    revalidatePath('/friends')
    return { message: 'Removed' }
}
