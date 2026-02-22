import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const defaultTitle = 'DramaPop – Watch Free Short Dramas';
const defaultDescription = 'Watch free short dramas online. Trending, romance, action, and more.';

export function usePageMeta(title?: string, description?: string) {
    const location = useLocation();

    useEffect(() => {
        // Title
        document.title = title ? `${title} | DramaPop` : defaultTitle;

        // Meta description
        let meta = document.querySelector('meta[name="description"]') as HTMLMetaElement;
        if (!meta) {
            meta = document.createElement('meta');
            meta.name = 'description';
            document.head.appendChild(meta);
        }
        meta.content = description || defaultDescription;

        // Theme color
        let theme = document.querySelector('meta[name="theme-color"]') as HTMLMetaElement;
        if (!theme) {
            theme = document.createElement('meta');
            theme.name = 'theme-color';
            document.head.appendChild(theme);
        }
        theme.content = '#09090b';

        return () => {
            document.title = defaultTitle;
        };
    }, [title, description, location.pathname]);
}
