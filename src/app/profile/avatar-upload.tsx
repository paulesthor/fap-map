'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import { createClient } from '@/utils/supabase/client'

export default function AvatarUpload({
    uid,
    url,
    onUpload
}: {
    uid: string
    url: string | null
    onUpload: (url: string) => void
}) {
    const supabase = createClient()
    const [avatarUrl, setAvatarUrl] = useState<string | null>(url)
    const [uploading, setUploading] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
        try {
            setUploading(true)

            if (!event.target.files || event.target.files.length === 0) {
                throw new Error('You must select an image to upload.')
            }

            const file = event.target.files[0]
            const fileExt = file.name.split('.').pop()
            const filePath = `${uid}/${Math.random()}.${fileExt}`

            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, file)

            if (uploadError) {
                throw uploadError
            }

            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(filePath)

            setAvatarUrl(publicUrl)
            onUpload(publicUrl)
        } catch (error) {
            alert('Error uploading avatar!')
            console.error(error)
        } finally {
            setUploading(false)
        }
    }

    return (
        <div className="flex flex-col items-center gap-4">
            <div
                className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-gray-700 cursor-pointer hover:border-white transition-colors group"
                onClick={() => fileInputRef.current?.click()}
            >
                {avatarUrl ? (
                    <Image
                        src={avatarUrl}
                        alt="Avatar"
                        fill
                        className="object-cover"
                    />
                ) : (
                    <div className="w-full h-full bg-gray-800 flex items-center justify-center text-4xl">
                        👤
                    </div>
                )}

                {/* Overlay */}
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-xs font-bold">Change</span>
                </div>
            </div>

            <input
                type="file"
                id="single"
                accept="image/*"
                onChange={uploadAvatar}
                disabled={uploading}
                ref={fileInputRef}
                className="hidden"
            />

            {uploading && <span className="text-xs text-blue-400">Uploading...</span>}
        </div>
    )
}
