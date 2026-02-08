import CameraCapture from './camera'
import Link from 'next/link'

export default function PostPage() {
    return (
        <div className="min-h-screen bg-black text-white p-4 flex flex-col items-center">
            <div className="w-full max-w-md flex justify-between items-center mb-4">
                <Link href="/" className="text-gray-400 text-sm">Cancel</Link>
                <h1 className="font-bold">New Post</h1>
                <div className="w-8"></div> {/* Spacer */}
            </div>

            <CameraCapture />
        </div>
    )
}
