'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function toggleLike(postId: string) {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        return { error: 'Not authenticated' }
    }

    // Check if like exists
    const { data: existingLike } = await supabase
        .from('likes')
        .select('id')
        .eq('user_id', user.id)
        .eq('post_id', postId)
        .single()

    if (existingLike) {
        // Unlike
        await supabase.from('likes').delete().eq('id', existingLike.id)
    } else {
        // Like
        await supabase.from('likes').insert({ user_id: user.id, post_id: postId })
    }

    revalidatePath('/')
    revalidatePath('/map')
    revalidatePath('/profile')
    return { success: true, liked: !existingLike }
}
