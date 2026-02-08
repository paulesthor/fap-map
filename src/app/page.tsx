import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import RealtimePosts from './realtime-posts'
import { Bell, Smile } from 'lucide-react'
import PostCard from '@/components/post-card'

// Helper function to format time ago
function timeAgo(dateString: string) {
  const date = new Date(dateString)
  const now = new Date()
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (seconds < 60) return `${seconds}s ago`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

export default async function Home() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch posts from friends and self
  // We use the policy we created: "Users can view posts from friends."
  const { data: posts } = await supabase
    .from('posts')
    .select(`
      id,
      back_image_url,
      front_image_url,
      caption,
      location,
      created_at,
      user_id,
      user:profiles(username, avatar_url),
      rating_isolation,
      rating_location,
      rating_surface,
      rating_brightness,
      rating_brightness,
      rating_average,
      duration
    `)
    .order('created_at', { ascending: false })

  interface Post {
    id: string
    user_id: string
    back_image_url: string
    front_image_url: string
    caption: string | null
    location: string | null
    created_at: string
    user: {
      username: string | null
      avatar_url: string | null
    }
    rating_isolation: number | null
    rating_location: number | null
    rating_surface: number | null
    rating_brightness: number | null
    rating_average: number | null
    duration: number | null
  }

  const typedPosts = (posts || []) as unknown as Post[]

  return (
    <div className="flex min-h-screen flex-col items-center bg-black text-white p-4">

      <main className="w-full max-w-md pb-32 space-y-8">
        {/* Header - Minimal */}
        <header className="flex justify-between items-center px-4 py-6 sticky top-0 z-40 bg-gradient-to-b from-background to-transparent">
          <h1 className="font-heading text-4xl text-cta tracking-tighter">FAP MAP</h1>
          <div className="w-10 h-10 rounded-full bg-surface border border-white/10 flex items-center justify-center hover:bg-white/5 cursor-pointer">
            <Bell size={20} className="text-text-muted" />
          </div>
        </header>

        <RealtimePosts />

        {typedPosts && typedPosts.length > 0 ? (
          typedPosts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center h-[50vh] text-center space-y-4">
            <div className="text-6xl animate-bounce text-text-muted"><Smile size={64} /></div>
            <p className="font-heading text-2xl">It&apos;s quiet...</p>
            <p className="text-text-muted">Be the first to drop a map.</p>
          </div>
        )}
      </main>

    </div>
  )
}
