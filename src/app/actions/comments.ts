'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function addComment(postId: string, content: string) {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        throw new Error('User not authenticated')
    }

    const { error } = await supabase.from('comments').insert({
        post_id: postId,
        user_id: user.id,
        content: content,
    })

    if (error) {
        throw new Error(error.message)
    }

    revalidatePath('/')
}

export async function getComments(postId: string) {
    const supabase = await createClient()

    const { data: comments, error } = await supabase
        .from('comments')
        .select(`
            id,
            content,
            created_at,
            user:profiles(username, avatar_url)
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: true })

    if (error) {
        console.error('Error fetching comments:', error)
        return []
    }

    return comments
}
