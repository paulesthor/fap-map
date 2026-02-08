'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function updateProfile(formData: FormData) {
    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const fullName = formData.get('fullName') as string
    const username = formData.get('username') as string
    const website = formData.get('website') as string
    const avatarUrl = formData.get('avatarUrl') as string

    const { error } = await supabase.from('profiles').upsert({
        id: user.id,
        full_name: fullName,
        username,
        website,
        avatar_url: avatarUrl,
        updated_at: new Date().toISOString(),
    })

    if (error) {
        return { error: 'Could not update profile' }
    }

    revalidatePath('/profile')
    revalidatePath('/')
    return { message: 'Profile updated' }
}

export async function signOut() {
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect('/login')
}
