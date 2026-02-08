'use client'

import { updateProfile } from './actions'
import { useState } from 'react'
import AvatarUpload from './avatar-upload'

interface UserProfile {
    id: string
    email?: string
    full_name?: string
    username?: string
    website?: string
    avatar_url?: string
}

export default function ProfileForm({ user }: { user: UserProfile }) {
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState<string | null>(null)
    const [avatarUrl, setAvatarUrl] = useState<string | null>(user.avatar_url || null)

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        setLoading(true)
        setMessage(null)

        const formData = new FormData(event.currentTarget)
        const result = await updateProfile(formData)

        if (result?.error) {
            setMessage(result.error)
        } else if (result?.message) {
            setMessage(result.message)
        }

        setLoading(false)
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6 bg-gray-900/50 p-6 rounded-lg border border-gray-800">
            <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-400">
                    Email
                </label>
                <input
                    id="email"
                    type="text"
                    value={user?.email}
                    disabled
                    className="mt-1 block w-full rounded-md border-gray-700 bg-gray-800 text-gray-500 shadow-sm focus:border-white focus:ring-white sm:text-sm p-2 cursor-not-allowed"
                />
            </div>

            <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-200">
                    Full Name
                </label>
                <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    defaultValue={user?.full_name || ''}
                    className="mt-1 block w-full rounded-md border-gray-700 bg-gray-800 text-white shadow-sm focus:border-white focus:ring-white sm:text-sm p-2"
                />
            </div>

            <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-200">
                    Username
                </label>
                <input
                    id="username"
                    name="username"
                    type="text"
                    defaultValue={user?.username || ''}
                    className="mt-1 block w-full rounded-md border-gray-700 bg-gray-800 text-white shadow-sm focus:border-white focus:ring-white sm:text-sm p-2"
                />
            </div>

            <div>
                <label htmlFor="website" className="block text-sm font-medium text-gray-200">
                    Website
                </label>
                <input
                    id="website"
                    name="website"
                    type="url"
                    defaultValue={user?.website || ''}
                    className="mt-1 block w-full rounded-md border-gray-700 bg-gray-800 text-white shadow-sm focus:border-white focus:ring-white sm:text-sm p-2"
                />
            </div>

            {/* Avatar Upload */}
            <div className="flex justify-center mb-6">
                <AvatarUpload
                    uid={user.id}
                    url={avatarUrl}
                    onUpload={(url) => {
                        setAvatarUrl(url)
                    }}
                />
                <input type="hidden" name="avatarUrl" value={avatarUrl || ''} />
            </div>

            {message && (
                <div className={`text-sm ${message.includes('error') ? 'text-red-400' : 'text-green-400'}`}>
                    {message}
                </div>
            )}

            <div>
                <button
                    type="submit"
                    disabled={loading}
                    className="flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-black shadow-sm hover:bg-gray-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white disabled:opacity-50"
                >
                    {loading ? 'Updating...' : 'Update Profile'}
                </button>
            </div>
        </form>
    )
}
