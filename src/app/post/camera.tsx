'use client'

import { useRef, useState, useCallback, useEffect } from 'react'
import Image from 'next/image'
import { createPost } from './actions'
import { useRouter } from 'next/navigation'

export default function CameraCapture() {
    const videoRef = useRef<HTMLVideoElement>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const [stream, setStream] = useState<MediaStream | null>(null)
    const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment')

    const [backPhoto, setBackPhoto] = useState<Blob | null>(null)
    const [frontPhoto, setFrontPhoto] = useState<Blob | null>(null)
    // New step: 'rate'
    const [step, setStep] = useState<'timer' | 'capture-back' | 'capture-front' | 'rate' | 'review'>('timer')
    const [loading, setLoading] = useState(false)
    const [location, setLocation] = useState<{ lat: number, lng: number } | null>(null)
    const [customLocation, setCustomLocation] = useState('')

    // Timer State
    const [sessionStartTime, setSessionStartTime] = useState<number | null>(null)
    const [elapsedTime, setElapsedTime] = useState(0)
    const [isSessionActive, setIsSessionActive] = useState(false)

    // Ratings State
    const [ratings, setRatings] = useState({
        isolation: 3,
        location: 3,
        surface: 3,
        brightness: 3
    })

    // Calculate average
    const averageRating = (
        (ratings.isolation + ratings.location + ratings.surface + ratings.brightness) / 4
    ).toFixed(1)

    const router = useRouter() // Keep router for potential redirects

    const startCamera = useCallback(async (mode: 'user' | 'environment') => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop())
        }

        try {
            const newStream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: mode,
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                },
                audio: false,
            })
            setStream(newStream)
            if (videoRef.current) {
                videoRef.current.srcObject = newStream
            }
        } catch (err) {
            console.error('Camera error:', err)
        }
    }, [stream])

    // Cleanup stream on unmount
    useEffect(() => {
        // Attempt to get location on mount
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setLocation({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    })
                },
                (err) => console.error("Location error:", err),
                { enableHighAccuracy: true }
            )
        }

        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop())
            }
        }
    }, [stream])

    // Timer Persistence Effect
    useEffect(() => {
        const storedStart = localStorage.getItem('fapmap_session_start')
        if (storedStart) {
            const start = parseInt(storedStart)
            // eslint-disable-next-line react-hooks/exhaustive-deps
            setSessionStartTime(start)
            setIsSessionActive(true)
            setStep('timer')

            // Calculate initial elapsed
            setElapsedTime(Math.floor((Date.now() - start) / 1000))
        }
    }, [])

    // Timer Interval Effect
    useEffect(() => {
        let interval: NodeJS.Timeout
        if (isSessionActive && sessionStartTime) {
            interval = setInterval(() => {
                const now = Date.now()
                setElapsedTime(Math.floor((now - sessionStartTime) / 1000))
            }, 1000)
        }
        return () => clearInterval(interval)
    }, [isSessionActive, sessionStartTime])

    const handleStartSession = () => {
        const now = Date.now()
        setSessionStartTime(now)
        setIsSessionActive(true)
        localStorage.setItem('fapmap_session_start', now.toString())
    }

    const handleStopSession = () => {
        setIsSessionActive(false)
        localStorage.removeItem('fapmap_session_start')
        setStep('capture-back')
    }

    const formatTime = (seconds: number) => {
        const h = Math.floor(seconds / 3600)
        const m = Math.floor((seconds % 3600) / 60)
        const s = seconds % 60
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
    }

    const handleStart = () => {
        startCamera(facingMode)
    }

    const capturePhoto = async () => {
        if (!videoRef.current || !canvasRef.current) return

        const video = videoRef.current
        const canvas = canvasRef.current

        canvas.width = video.videoWidth
        canvas.height = video.videoHeight

        const ctx = canvas.getContext('2d')
        if (ctx) {
            if (facingMode === 'user') {
                ctx.translate(canvas.width, 0)
                ctx.scale(-1, 1)
            }
            ctx.drawImage(video, 0, 0)

            canvas.toBlob((blob) => {
                if (!blob) return
                processPhoto(blob)
            }, 'image/jpeg', 0.8)
        }
    }

    const processPhoto = (blob: Blob) => {
        if (step === 'capture-back') {
            setBackPhoto(blob)
            setStep('capture-front')
            setFacingMode('user')
            // Automatically switch camera if using stream
            if (stream) startCamera('user')
        } else if (step === 'capture-front') {
            setFrontPhoto(blob)
            // Go to rating step instead of review
            setStep('rate')
            // Stop camera
            if (stream) {
                stream.getTracks().forEach(track => track.stop())
                setStream(null)
            }
        }
    }

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            processPhoto(e.target.files[0])
        }
        // Reset input
        if (fileInputRef.current) fileInputRef.current.value = ''
    }

    const triggerFileUpload = () => {
        fileInputRef.current?.click()
    }

    const handleRetake = () => {
        setBackPhoto(null)
        setFrontPhoto(null)
        setStep('capture-back')
        setFacingMode('environment')
        startCamera('environment')
    }

    const handleSubmit = async () => {
        if (!backPhoto || !frontPhoto) return
        setLoading(true)

        const formData = new FormData()
        formData.append('backImage', backPhoto, 'back.jpg')
        formData.append('frontImage', frontPhoto, 'front.jpg')
        formData.append('caption', '')

        if (location) {
            formData.append('lat', location.lat.toString())
            formData.append('lng', location.lng.toString())
        }
        formData.append('customLocation', customLocation)
        formData.append('duration', elapsedTime.toString())

        // Add ratings
        formData.append('rating_isolation', ratings.isolation.toString())
        formData.append('rating_location', ratings.location.toString())
        formData.append('rating_surface', ratings.surface.toString())
        formData.append('rating_brightness', ratings.brightness.toString())

        await createPost(formData)
    }

    const renderRatingSlider = (label: string, value: number, field: keyof typeof ratings) => (
        <div className="w-full space-y-2">
            <div className="flex justify-between">
                <label className="font-bold text-sm text-gray-300">{label}</label>
                <span className="font-bold text-blue-400">{value}/5</span>
            </div>
            <input
                type="range"
                min="1"
                max="5"
                step="1"
                value={value}
                onChange={(e) => setRatings(prev => ({ ...prev, [field]: parseInt(e.target.value) }))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
        </div>
    )

    return (
        <div className="flex flex-col items-center w-full max-w-md mx-auto min-h-[80vh] bg-black relative rounded-xl overflow-hidden shadow-2xl border border-gray-800">

            <canvas ref={canvasRef} className="hidden" />
            <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={handleFileUpload}
            />

            {step === 'timer' ? (
                <div className="w-full h-full flex flex-col items-center justify-center space-y-12 p-6 bg-gray-900/50 backdrop-blur">
                    <div className="space-y-4 text-center">
                        <h2 className="text-3xl font-bold text-white">Chronomètre</h2>
                        <div className="text-7xl font-mono font-bold text-blue-500 tabular-nums tracking-wider text-shadow-glow">
                            {formatTime(elapsedTime)}
                        </div>
                        <p className="text-gray-400">
                            {isSessionActive
                                ? "Session en cours..."
                                : "Prêt pour votre session ?"}
                        </p>
                    </div>

                    <div className="w-full max-w-xs space-y-4">
                        {!isSessionActive ? (
                            <button
                                onClick={handleStartSession}
                                className="w-full py-6 rounded-2xl bg-gradient-to-r from-blue-600 to-blue-400 text-white font-black text-2xl shadow-lg hover:scale-105 transition-transform"
                            >
                                DÉMARRER ⏱️
                            </button>
                        ) : (
                            <button
                                onClick={handleStopSession}
                                className="w-full py-6 rounded-2xl bg-gradient-to-r from-red-600 to-red-400 text-white font-black text-2xl shadow-lg hover:scale-105 transition-transform animate-pulse"
                            >
                                STOP 🛑
                            </button>
                        )}

                        {/* Emergency bypass for testing or non-timed posts */}
                        {!isSessionActive && (
                            <button
                                onClick={() => setStep('capture-back')}
                                className="w-full py-3 text-gray-500 text-sm hover:text-white transition-colors"
                            >
                                Passer le chrono (Poster direct)
                            </button>
                        )}
                    </div>
                </div>
            ) : step === 'capture-back' || step === 'capture-front' ? (
                <>
                    <div className="relative w-full h-[600px] bg-gray-900 flex items-center justify-center">
                        {stream ? (
                            <video
                                ref={videoRef}
                                autoPlay
                                playsInline
                                muted
                                className={`w-full h-full object-cover ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`}
                            />
                        ) : (
                            <div className="flex flex-col gap-4">
                                <button onClick={handleStart} className="bg-white text-black px-6 py-3 rounded-full font-bold">
                                    Ouvrir la Caméra
                                </button>
                                <span className="text-gray-500 text-sm font-center">OU</span>
                                <button onClick={triggerFileUpload} className="bg-gray-800 text-white px-6 py-3 rounded-full font-bold border border-gray-600">
                                    Upload Fichier
                                </button>
                            </div>
                        )}

                        <div className="absolute top-4 left-0 right-0 text-center pointer-events-none">
                            <span className="bg-black/50 text-white px-4 py-1 rounded-full text-sm font-bold backdrop-blur">
                                {step === 'capture-back' ? '1. Photo Arrière (Scène)' : '2. Photo Avant (Selfie)'}
                            </span>
                            {location && (
                                <div className="mt-2">
                                    <span className="text-[10px] text-green-400 bg-black/50 px-2 py-0.5 rounded">📍 GPS Actif</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="absolute bottom-8 w-full flex justify-center items-center gap-8">
                        {stream ? (
                            <button
                                onClick={() => {
                                    const newMode = facingMode === 'user' ? 'environment' : 'user'
                                    setFacingMode(newMode)
                                    startCamera(newMode)
                                }}
                                className="p-3 rounded-full bg-gray-800/80 text-white backdrop-blur"
                            >
                                🔄
                            </button>
                        ) : (
                            <div className="w-12 h-12" />
                        )}

                        <button
                            onClick={stream ? capturePhoto : triggerFileUpload}
                            className="w-20 h-20 rounded-full border-4 border-white bg-transparent p-1 flex items-center justify-center hover:bg-white/10 transition-colors"
                        >
                            <div className="w-full h-full bg-white rounded-full" />
                        </button>

                        <div className="w-12" />
                    </div>
                </>
            ) : step === 'rate' ? (
                <div className="w-full h-full flex flex-col p-6 space-y-8 bg-gray-900/50 backdrop-blur">
                    <div className="text-center space-y-2">
                        <h2 className="text-2xl font-bold">Notez la Session</h2>
                        <p className="text-gray-400 text-sm">Comment c'était ?</p>
                    </div>

                    <div className="space-y-6 bg-black/40 p-6 rounded-xl border border-gray-800">
                        {renderRatingSlider("Isolation 🧘", ratings.isolation, 'isolation')}
                        {renderRatingSlider("Lieu 📍", ratings.location, 'location')}
                        {renderRatingSlider("Surface 📏", ratings.surface, 'surface')}
                        {renderRatingSlider("Lumière 💡", ratings.brightness, 'brightness')}

                        <div className="pt-4 border-t border-gray-700 flex justify-between items-center">
                            <span className="text-lg font-bold">Note Moyenne</span>
                            <span className="text-4xl font-black text-yellow-400">{averageRating}</span>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <button
                            onClick={() => setStep('review')}
                            className="w-full py-4 rounded-xl bg-white text-black font-bold text-lg hover:bg-gray-200 transition-colors"
                        >
                            Suivant →
                        </button>
                    </div>
                </div>
            ) : (
                <div className="w-full h-full flex flex-col p-4 space-y-4">
                    <h2 className="text-xl font-bold text-center">Récapitulatif</h2>

                    <div className="relative w-full aspect-[3/4] bg-gray-900 rounded-lg overflow-hidden">
                        {backPhoto && (
                            <Image
                                src={URL.createObjectURL(backPhoto)}
                                alt="Back camera"
                                fill
                                className="object-cover"
                            />
                        )}

                        {frontPhoto && (
                            <div className="absolute top-4 left-4 w-1/3 aspect-[3/4] bg-black rounded-lg overflow-hidden border-2 border-black shadow-lg relative">
                                <Image
                                    src={URL.createObjectURL(frontPhoto)}
                                    alt="Front camera"
                                    fill
                                    className="object-cover scale-x-[-1]"
                                    unoptimized // Fix for blob URL
                                />
                            </div>
                        )}

                        <div className="absolute bottom-4 right-4 bg-black/70 backdrop-blur px-3 py-1 rounded-full border border-yellow-500/50">
                            <span className="text-yellow-400 font-bold">★ {averageRating}</span>
                        </div>
                    </div>

                    {/* Location Input */}
                    <div className="w-full space-y-2">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Nom du Lieu</label>
                        <input
                            type="text"
                            value={customLocation}
                            onChange={(e) => setCustomLocation(e.target.value)}
                            placeholder={location ? "ex: Mon Spot Secret" : "ex: Maison"}
                            className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-white/50 transition-colors"
                        />
                        {location && !customLocation && (
                            <p className="text-[10px] text-gray-500">Laisser vide utilisera les coordonnées GPS.</p>
                        )}
                    </div>

                    <div className="flex gap-4 w-full">
                        <button
                            onClick={handleRetake}
                            className="flex-1 py-3 items-center justify-center rounded-lg bg-gray-800 font-bold hover:bg-gray-700"
                        >
                            Refaire
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={loading}
                            className="flex-1 py-3 items-center justify-center rounded-lg bg-white text-black font-bold hover:bg-gray-200 disabled:opacity-50"
                        >
                            {loading ? 'Envoi...' : 'Envoyer 🚀'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
