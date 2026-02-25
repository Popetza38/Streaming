import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const defaultTitle = 'DramaBox – Watch Free Short Dramas';
const defaultDescription = 'Watch free short dramas online. Trending, romance, action, and more.';

export function usePageMeta(title?: string, description?: string, image?: string) {
    const location = useLocation();

    useEffect(() => {
        // Title
        document.title = title ? `${title} | DramaBox` : defaultTitle;

        let meta = document.querySelector('meta[name="description"]') as HTMLMetaElement;
        if (!meta) {
            meta = document.createElement('meta');
            meta.name = 'description';
            document.head.appendChild(meta);
        }
        meta.content = description || defaultDescription;

        // OpenGraph tags
        const setOgTag = (property: string, content: string) => {
            let tag = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement;
            if (!tag) {
                tag = document.createElement('meta');
                tag.setAttribute('property', property);
                document.head.appendChild(tag);
            }
            tag.content = content;
        };

        setOgTag('og:title', document.title);
        setOgTag('og:description', meta.content);
        if (image) setOgTag('og:image', image);

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
            const ogImage = document.querySelector('meta[property="og:image"]');
            if (ogImage) ogImage.remove();
        };
    }, [title, description, image, location.pathname]);
}
