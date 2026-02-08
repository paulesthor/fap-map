import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import ProfileView from './profile-view'

export default async function ProfilePage() {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Parallel fetching for performance
    const [profileData, postsData, commentsData] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase.from('posts').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
        supabase.from('comments').select('*', { count: 'exact', head: true }).eq('user_id', user.id)
    ])

    const profile = profileData.data
    const posts = postsData.data || []
    const commentCount = commentsData.count || 0

    return <ProfileView profile={profile} posts={posts} commentCount={commentCount} />
}
