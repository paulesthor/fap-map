'use client'

import dynamic from 'next/dynamic'

// Dynamically import MapView to avoid SSR issues with Leaflet
const MapView = dynamic(() => import('./map-view'), {
    ssr: false,
    loading: () => <div className="w-full h-full flex items-center justify-center bg-gray-900 text-white">Loading Map...</div>
})

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

interface UserProfile {
    username: string | null
    avatar_url: string | null
}

export default function MapWrapper({ posts, userProfile }: { posts: PostLocation[], userProfile: UserProfile | null }) {
    return <MapView posts={posts} userProfile={userProfile} />
}
