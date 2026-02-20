'use client';

import { useState } from 'react';
import { Share2, Check } from 'lucide-react';

export default function ShareButton() {
    const [copied, setCopied] = useState(false);

    const handleShare = async () => {
        const url = window.location.href;

        // Try native share first (mobile)
        if (navigator.share) {
            try {
                await navigator.share({ title: document.title, url });
                return;
            } catch {
                // User cancelled or not supported, fallback to clipboard
            }
        }

        // Fallback: copy to clipboard
        try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            // Fallback for older browsers
            const input = document.createElement('input');
            input.value = url;
            document.body.appendChild(input);
            input.select();
            document.execCommand('copy');
            document.body.removeChild(input);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <button
            onClick={handleShare}
            className="btn-ghost flex items-center gap-2 px-5 py-3 rounded-md text-sm backdrop-blur-md relative"
        >
            {copied ? (
                <>
                    <Check className="w-4 h-4 text-accent" />
                    <span className="text-accent">คัดลอกแล้ว!</span>
                </>
            ) : (
                <>
                    <Share2 className="w-4 h-4" />
                    แชร์
                </>
            )}
        </button>
    );
}
