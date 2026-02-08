'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export async function createPost(formData: FormData) {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        return { error: 'Not authenticated' }
    }

    const backImage = formData.get('backImage') as File
    const frontImage = formData.get('frontImage') as File
    const caption = formData.get('caption') as string

    // Parse location
    const latStr = formData.get('lat') as string
    const lngStr = formData.get('lng') as string
    const lat = latStr ? parseFloat(latStr) : null
    const lng = lngStr ? parseFloat(lngStr) : null
    const customLocation = formData.get('customLocation') as string
    const durationStr = formData.get('duration') as string
    const duration = durationStr ? parseInt(durationStr) : 0

    // Parse ratings
    const r_isolation = parseInt(formData.get('rating_isolation') as string || '3')
    const r_location = parseInt(formData.get('rating_location') as string || '3')
    const r_surface = parseInt(formData.get('rating_surface') as string || '3')
    const r_brightness = parseInt(formData.get('rating_brightness') as string || '3')

    // Calculate average
    const rating_average = (r_isolation + r_location + r_surface + r_brightness) / 4

    if (!backImage || !frontImage) {
        return { error: 'Both images are required' }
    }

    // Helper to upload file
    const uploadFile = async (file: File, prefix: string) => {
        const fileExt = file.name.split('.').pop()
        const fileName = `${user.id}/${prefix}_${Date.now()}.${fileExt}`

        const { error: uploadError } = await supabase.storage
            .from('posts')
            .upload(fileName, file)

        if (uploadError) {
            console.error('Upload error:', uploadError)
            throw new Error('Failed to upload image')
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
            .from('posts')
            .getPublicUrl(fileName)

        return publicUrl
    }

    try {
        const backImageUrl = await uploadFile(backImage, 'back')
        const frontImageUrl = await uploadFile(frontImage, 'front')

        // Determine display location
        let displayLocation = 'Unknown'
        if (customLocation && customLocation.trim() !== '') {
            displayLocation = customLocation.trim()
        } else if (lat && lng) {
            displayLocation = `${lat.toFixed(4)}, ${lng.toFixed(4)}`
        }

        const { error: dbError } = await supabase.from('posts').insert({
            user_id: user.id,
            back_image_url: backImageUrl,
            front_image_url: frontImageUrl,
            caption,
            lat,
            lng,
            location: displayLocation,
            duration,
            rating_isolation: r_isolation,
            rating_location: r_location,
            rating_surface: r_surface,
            rating_brightness: r_brightness,
            rating_average: rating_average
        })

        if (dbError) {
            console.error('DB Error:', dbError)
            return { error: 'Failed to save post' }
        }

    } catch (err) {
        console.error(err)
        return { error: 'Something went wrong during upload' }
    }

    redirect('/')
}
