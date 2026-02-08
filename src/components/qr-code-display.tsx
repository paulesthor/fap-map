'use client'

import QRCode from 'react-qr-code'

interface QRCodeDisplayProps {
    value: string
    size?: number
}

export default function QRCodeDisplay({ value, size = 256 }: QRCodeDisplayProps) {
    return (
        <div className="p-4 bg-white rounded-xl shadow-[0_0_30px_rgba(255,255,255,0.2)]">
            <div style={{ height: "auto", margin: "0 auto", maxWidth: size, width: "100%" }}>
                <QRCode
                    size={256}
                    style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                    value={value}
                    viewBox={`0 0 256 256`}
                />
            </div>
            <p className="text-black text-center font-mono text-xs mt-2 break-all opacity-50">
                {value}
            </p>
        </div>
    )
}
