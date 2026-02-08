'use client'

import { Scanner } from '@yudiel/react-qr-scanner'
import { useState } from 'react'

interface QRScannerProps {
    onScan: (data: string) => void
    onError?: (error: unknown) => void
}

export default function QRScanner({ onScan, onError }: QRScannerProps) {
    const [enabled, setEnabled] = useState(true)
    const [errorMsg, setErrorMsg] = useState<string | null>(null)

    const handleScan = (detectedCodes: { rawValue: string }[]) => {
        if (detectedCodes && detectedCodes.length > 0) {
            const code = detectedCodes[0].rawValue
            // Validation simple: doit contenir "fapmap:friend:" ou être un ID uuid
            if (code) {
                setEnabled(false) // Stop scanning on success
                onScan(code)
            }
        }
    }

    const handleError = (error: unknown) => {
        console.error(error)
        const msg = error instanceof Error ? error.message : String(error)
        setErrorMsg(`Erreur caméra: ${msg}. Vérifiez que vous êtes en HTTPS et avez autorisé la caméra.`)
        onError?.(error)
    }

    return (
        <div className="w-full aspect-square relative rounded-xl overflow-hidden bg-black border-2 border-cta shadow-[0_0_20px_rgba(244,63,94,0.3)]">
            {errorMsg ? (
                <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center">
                    <p className="text-red-500 font-bold mb-2">⚠️ Impossible d'accéder à la caméra</p>
                    <p className="text-xs text-gray-400">{errorMsg}</p>
                </div>
            ) : enabled ? (
                <>
                    <Scanner
                        onScan={handleScan}
                        onError={handleError}
                        components={{
                            finder: true,
                        }}
                        constraints={{
                            facingMode: 'environment'
                        }}
                        styles={{
                            container: { width: '100%', height: '100%' }
                        }}
                    />
                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                        <div className="w-64 h-64 border-2 border-white/50 rounded-lg relative">
                            <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-cta -mt-1 -ml-1"></div>
                            <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-cta -mt-1 -mr-1"></div>
                            <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-cta -mb-1 -ml-1"></div>
                            <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-cta -mb-1 -mr-1"></div>
                        </div>
                    </div>
                    <p className="absolute bottom-4 left-0 right-0 text-center text-white font-bold text-shadow text-sm">
                        Scannez le code d'un ami
                    </p>
                </>
            ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-900">
                    <p className="text-green-400 font-bold animate-pulse">Code détecté !</p>
                </div>
            )}
        </div>
    )
}
