import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import ProfileView from '../profile-view'

interface Props {
    params: Promise<{ id: string }>
}

export default async function UserProfilePage({ params }: Props) {
    const { id } = await params
    const supabase = await createClient()

    const {
        data: { user: currentUser },
    } = await supabase.auth.getUser()

    if (!currentUser) {
        redirect('/login')
    }

    // Check if looking at own profile
    const isOwnProfile = currentUser.id === id

    if (isOwnProfile) {
        // Redirect to main profile page if it's the current user
        // This keeps the URL clean (/profile) for the owner
        redirect('/profile')
    }

    // Parallel fetching
    const [profileData, postsData, commentsData] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', id).single(),
        supabase.from('posts').select('*').eq('user_id', id).order('created_at', { ascending: false }),
        supabase.from('comments').select('*', { count: 'exact', head: true }).eq('user_id', id)
    ])

    const profile = profileData.data
    const posts = postsData.data || []
    const commentCount = commentsData.count || 0

    if (!profile) {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center p-4 text-center">
                <div>
                    <h1 className="text-4xl font-heading text-cta mb-4">404</h1>
                    <p className="text-gray-400">Utilisateur introuvable ou n'existe pas.</p>
                </div>
            </div>
        )
    }

    return (
        <ProfileView
            profile={profile}
            posts={posts}
            commentCount={commentCount}
            isOwnProfile={false}
        />
    )
}
