'use client';

import { useState, useEffect, useCallback } from 'react';

export interface WatchHistoryItem {
    dramaId: string;
    dramaTitle: string;
    cover: string;
    episode: number;
    totalEpisodes: number;
    progress: number; // 0-100 percentage
    timestamp: number;
}

const STORAGE_KEY = 'dramaku_watch_history';
const MAX_ITEMS = 20;

function getHistory(): WatchHistoryItem[] {
    if (typeof window === 'undefined') return [];
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    } catch {
        return [];
    }
}

function saveHistory(items: WatchHistoryItem[]) {
    if (typeof window === 'undefined') return;
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(items.slice(0, MAX_ITEMS)));
    } catch {
        // Storage full or unavailable
    }
}

export function useWatchHistory() {
    const [history, setHistory] = useState<WatchHistoryItem[]>([]);

    useEffect(() => {
        setHistory(getHistory());
    }, []);

    const addToHistory = useCallback((item: Omit<WatchHistoryItem, 'timestamp'>) => {
        const newItem: WatchHistoryItem = {
            ...item,
            timestamp: Date.now(),
        };

        setHistory((prev) => {
            const filtered = prev.filter((h) => h.dramaId !== item.dramaId);
            const updated = [newItem, ...filtered].slice(0, MAX_ITEMS);
            saveHistory(updated);
            return updated;
        });
    }, []);

    const updateProgress = useCallback((dramaId: string, progress: number, episode: number) => {
        setHistory((prev) => {
            const updated = prev.map((item) =>
                item.dramaId === dramaId
                    ? { ...item, progress, episode, timestamp: Date.now() }
                    : item
            );
            // Move updated item to front
            const idx = updated.findIndex((item) => item.dramaId === dramaId);
            if (idx > 0) {
                const [item] = updated.splice(idx, 1);
                updated.unshift(item);
            }
            saveHistory(updated);
            return updated;
        });
    }, []);

    const clearHistory = useCallback(() => {
        setHistory([]);
        if (typeof window !== 'undefined') {
            localStorage.removeItem(STORAGE_KEY);
        }
    }, []);

    const removeFromHistory = useCallback((dramaId: string) => {
        setHistory((prev) => {
            const updated = prev.filter((h) => h.dramaId !== dramaId);
            saveHistory(updated);
            return updated;
        });
    }, []);

    return {
        history,
        addToHistory,
        updateProgress,
        clearHistory,
        removeFromHistory,
    };
}
