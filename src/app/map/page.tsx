import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import MapWrapper from './map-wrapper'

export default async function MapPage() {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Fetch posts with location data AND ratings/photos
    const { data: posts } = await supabase
        .from('posts')
        .select(`
      id,
      lat,
      lng,
      rating_average,
      back_image_url,
      user:profiles(username, avatar_url)
    `)
        .not('lat', 'is', null)
        .order('created_at', { ascending: false })
        .limit(50) // Limit to recent 50 posts for performance

    interface PostLocation {
        id: string
        lat: number
        lng: number
        user: {
            username: string
            avatar_url: string | null
        }
        rating_average: number | null
        back_image_url: string
    }

    // Fetch current user profile for the "You" marker
    const { data: userProfile } = await supabase
        .from('profiles')
        .select('username, avatar_url')
        .eq('id', user.id)
        .single()

    const typedPosts = (posts || []) as unknown as PostLocation[] // Type assertion

    return (
        <div className="fixed inset-0 z-0 bg-background">
            {/* Map Container - Full Screen */}
            <div className="absolute inset-0 pb-16"> {/* pb-16 to clear BottomNav */}
                <MapWrapper posts={typedPosts} userProfile={userProfile} />
            </div>

            {/* Floating Title (Overlay) */}
            <div className="absolute top-6 left-1/2 -translate-x-1/2 z-[1000] bg-surface/80 backdrop-blur px-4 py-2 rounded-full border border-white/10 shadow-lg pointer-events-none">
                <h1 className="font-heading text-xl text-cta tracking-wide">FAP MAP</h1>
            </div>
        </div>
    )
}
