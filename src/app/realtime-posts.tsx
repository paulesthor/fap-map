'use client'

import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function RealtimePosts() {
    const router = useRouter()
    const supabase = createClient()

    useEffect(() => {
        const channel = supabase
            .channel('realtime posts')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'posts',
                },
                () => {
                    router.refresh()
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [router, supabase])

    return null
}
