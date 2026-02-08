'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export async function createPost(formData: FormData) {
    console.log('--- START createPost ---')
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        console.error('CreatePost: Not authenticated')
        return { error: 'Not authenticated' }
    }
    console.log('CreatePost: User authenticated', user.id)

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
        console.error('CreatePost: Missing images')
        return { error: 'Both images are required' }
    }

    console.log(`CreatePost: Photos received. Back: ${backImage.size} bytes, Front: ${frontImage.size} bytes`)

    // Helper to upload file
    const uploadFile = async (file: File, prefix: string) => {
        const fileExt = file.name.split('.').pop()
        const fileName = `${user.id}/${prefix}_${Date.now()}.${fileExt}`

        console.log(`CreatePost: Uploading ${prefix} image...`)
        const { error: uploadError } = await supabase.storage
            .from('posts')
            .upload(fileName, file)

        if (uploadError) {
            console.error(`CreatePost: Upload error for ${prefix}:`, uploadError)
            throw new Error('Failed to upload image')
        }
        console.log(`CreatePost: Upload success for ${prefix}`)

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

        console.log('CreatePost: Inserting into DB...')
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
            console.error('CreatePost: DB Error:', dbError)
            return { error: 'Failed to save post' }
        }
        console.log('CreatePost: Insert success')

    } catch (err) {
        console.error('CreatePost: Exception:', err)
        return { error: 'Something went wrong during upload' }
    }

    console.log('--- END createPost ---')
    return { success: true }
}
