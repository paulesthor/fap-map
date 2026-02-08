'use client'

import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { useEffect, useState } from 'react'

// Fix for default Leaflet markers in Next.js/React
const DefaultIcon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
})

L.Marker.prototype.options.icon = DefaultIcon

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

// Component to handle map center updates
function MapController({ center }: { center: [number, number] }) {
    const map = useMap()
    useEffect(() => {
        if (center) {
            map.flyTo(center, map.getZoom())
        }
    }, [center, map])
    return null
}

export default function MapView({ posts, userProfile }: { posts: PostLocation[], userProfile: UserProfile | null }) {
    const [userLocation, setUserLocation] = useState<[number, number] | null>(null)
    const [mapCenter, setMapCenter] = useState<[number, number]>([48.8566, 2.3522]) // Default Paris
    const [geoError, setGeoError] = useState<string | null>(null)

    // Calculate bounds of all posts + user location
    useEffect(() => {
        if (posts.length === 0 && !userLocation) return

        const points: [number, number][] = posts.map(p => [p.lat, p.lng])
        if (userLocation) {
            points.push(userLocation)
        }

        if (points.length > 0) {
            const bounds = L.latLngBounds(points)
            // Expand bounds slightly for padding
            setMapBounds(bounds.pad(0.1))
        }
    }, [posts, userLocation])

    // State for map bounds
    const [mapBounds, setMapBounds] = useState<L.LatLngBounds | null>(null)

    useEffect(() => {
        if (!navigator.geolocation) {
            // If no geo support, just fail silently and relying on posts bounds
            console.log('Geolocation not supported')
            return
        }

        const success = (position: GeolocationPosition) => {
            const newLoc: [number, number] = [position.coords.latitude, position.coords.longitude]
            setUserLocation(newLoc)
            setGeoError(null)
        }

        const error = (err: GeolocationPositionError) => {
            console.warn('Geolocation failed:', err.message)
            // Silent fail on load - don't annoy user unless they asked for it
        }

        const options = {
            enableHighAccuracy: false,
            timeout: 15000,
            maximumAge: 0
        }

        // Try to get position silently
        navigator.geolocation.getCurrentPosition(success, error, options)
    }, [posts.length])

    // Map controller to handle bounds
    function MapBoundsController({ bounds }: { bounds: L.LatLngBounds | null }) {
        const map = useMap()
        useEffect(() => {
            if (bounds) {
                map.flyToBounds(bounds, { padding: [50, 50], maxZoom: 16 })
            }
        }, [bounds, map])
        return null
    }



    const handleLocate = () => {
        if (!navigator.geolocation) {
            setGeoError("La géolocalisation n'est pas supportée par votre navigateur.")
            return
        }

        setGeoError(null)

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const newLoc: [number, number] = [position.coords.latitude, position.coords.longitude]
                setUserLocation(newLoc)
                setMapCenter(newLoc)
            },
            (err) => {
                console.warn('Manual geolocation failed:', err.message)
                let msg = "Impossible de vous localiser."

                // Specific iOS helpful message
                if (err.code === err.PERMISSION_DENIED) {
                    msg = "⚠️ Accès refusé. Sur iPhone : Réglages > Confidentialité > Service de localisation > Safari > Choisir 'Lorsque l'app est active'."
                }
                if (err.code === err.TIMEOUT) msg = "Délai d'attente dépassé. Réessayez dehors."

                setGeoError(msg)
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }
        )
    }

    return (
        <div className="w-full h-full relative font-sans">
            {geoError && (
                <div className="absolute top-24 left-4 right-4 z-[1000] animate-in slide-in-from-top-2 fade-in duration-300">
                    <div className="bg-red-500/90 text-white p-3 rounded-lg text-sm text-center shadow-lg backdrop-blur flex items-center justify-between gap-2">
                        <span>{geoError}</span>
                        <button onClick={() => setGeoError(null)} className="text-white/80 hover:text-white font-bold px-2">✕</button>
                    </div>
                </div>
            )}

            <MapContainer
                center={mapCenter}
                zoom={14}
                style={{ height: '100%', width: '100%' }}
                className="z-0 bg-background"
                zoomControl={false}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" // Dark Mode Map
                />

                <MapController center={mapCenter} />
                <MapBoundsController bounds={mapBounds} />

                {/* User Marker (Custom Avatar) */}
                {userLocation && (
                    <Marker
                        position={userLocation}
                        icon={L.divIcon({
                            className: 'bg-transparent',
                            html: `<div class="w-16 h-16 rounded-full overflow-hidden border-4 border-cta shadow-[0_0_20px_rgba(244,63,94,0.5)] relative animate-pulse">
                                     ${userProfile?.avatar_url ? `<img src="${userProfile.avatar_url}" style="width:100%;height:100%;object-fit:cover;" />` : '<div style="background:#F43F5E;width:100%;height:100%;display:flex;align-items:center;justify-content:center;color:white;font-size:24px;">👤</div>'}
                                   </div>`,
                            iconSize: [64, 64],
                            iconAnchor: [32, 32]
                        })}
                        zIndexOffset={1000} // Keep on top
                    >
                        <Popup className="custom-popup">
                            <div className="font-heading text-lg text-center">You</div>
                        </Popup>
                    </Marker>
                )}

                {/* Friend Posts Markers */}
                {posts.map(post => {
                    // Safe access to user (Supabase might return array or object)
                    const postUser = Array.isArray(post.user) ? post.user[0] : post.user
                    const username = postUser?.username || 'Unknown'
                    const avatar = postUser?.avatar_url

                    return (
                        <Marker
                            key={post.id}
                            position={[post.lat, post.lng]}
                            icon={L.divIcon({
                                className: 'bg-transparent',
                                html: `<div class="w-12 h-12 rounded-full overflow-hidden border-2 border-white/50 shadow-lg relative grayscale hover:grayscale-0 transition-all hover:scale-110">
                             ${avatar ? `<img src="${avatar}" style="width:100%;height:100%;object-fit:cover;" />` : '<div style="background:#555;width:100%;height:100%;"></div>'}
                           </div>`,
                                iconSize: [48, 48],
                                iconAnchor: [24, 24]
                            })}
                        >
                            <Popup className="custom-popup">
                                <div className="font-heading text-lg text-center mb-1">{username}</div>
                                {post.rating_average && (
                                    <div className="text-center bg-yellow-400/10 text-yellow-400 font-bold text-xs uppercase tracking-wider mb-2 py-0.5 rounded">★ {post.rating_average} Rating</div>
                                )}
                                <div className="w-40 h-52 relative mt-2 rounded-lg overflow-hidden border border-white/10 shadow-xl">
                                    <img src={post.back_image_url} alt="Post" className="w-full h-full object-cover" />
                                </div>
                            </Popup>
                        </Marker>
                    )
                })}
            </MapContainer>

            {/* Floating Action Buttons */}
            <div className="absolute bottom-24 right-4 flex flex-col gap-3 z-[1000]">
                <button
                    onClick={handleLocate}
                    className="p-4 bg-cta/80 backdrop-blur text-white rounded-full shadow-[0_0_15px_rgba(244,63,94,0.4)] hover:scale-105 active:scale-95 transition-all text-2xl flex items-center justify-center border border-white/20"
                    title="Locate Me"
                >
                    📍
                </button>
            </div>
        </div>
    )
}
