import { create } from 'zustand';
import { useEffect } from 'react';

interface Toast {
    id: string;
    message: string;
    type: 'success' | 'error' | 'info';
}

interface ToastState {
    toasts: Toast[];
    show: (message: string, type?: Toast['type']) => void;
    dismiss: (id: string) => void;
}

export const useToastStore = create<ToastState>((set) => ({
    toasts: [],
    show: (message, type = 'info') => {
        const id = Date.now().toString(36) + Math.random().toString(36).slice(2);
        set((s) => ({ toasts: [...s.toasts, { id, message, type }] }));
        // Auto dismiss after 3s
        setTimeout(() => {
            set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
        }, 3000);
    },
    dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));

const typeStyles: Record<string, string> = {
    success: 'bg-green-600 text-white',
    error: 'bg-red-600 text-white',
    info: 'bg-zinc-800 text-white border border-zinc-700',
};

export default function Toaster() {
    const { toasts, dismiss } = useToastStore();

    // Dismiss on Escape
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && toasts.length > 0) dismiss(toasts[toasts.length - 1].id);
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [toasts, dismiss]);

    if (toasts.length === 0) return null;

    return (
        <div className="fixed top-16 right-4 z-[9999] flex flex-col gap-2 max-w-sm">
            {toasts.map((toast) => (
                <div
                    key={toast.id}
                    className={`px-4 py-3 rounded-xl shadow-lg text-sm font-medium animate-slide-in cursor-pointer backdrop-blur-md ${typeStyles[toast.type]}`}
                    onClick={() => dismiss(toast.id)}
                >
                    {toast.message}
                </div>
            ))}
        </div>
    );
}
