import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const siteName = 'DramaPop';
const defaultTitle = 'DramaPop – ดูซีรีส์สั้นออนไลน์ฟรี | Short Drama Streaming';
const defaultDescription = 'รวมซีรีส์สั้นจากทุกแพลตฟอร์ม ดูฟรี พากไทย ซับไทย DramaBox, ShortMax, FlexTV, DramaPops, DramaBite, FunDrama อัปเดตทุกวัน';

export function usePageMeta(title?: string, description?: string, image?: string) {
    const location = useLocation();

    useEffect(() => {
        // Title
        document.title = title ? `${title} | ${siteName}` : defaultTitle;

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
        setOgTag('og:site_name', siteName);
        setOgTag('og:type', 'website');
        if (image) setOgTag('og:image', image);

        // Twitter Card
        const setTwitterTag = (name: string, content: string) => {
            let tag = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement;
            if (!tag) {
                tag = document.createElement('meta');
                tag.name = name;
                document.head.appendChild(tag);
            }
            tag.content = content;
        };

        setTwitterTag('twitter:card', image ? 'summary_large_image' : 'summary');
        setTwitterTag('twitter:title', document.title);
        setTwitterTag('twitter:description', meta.content);
        if (image) setTwitterTag('twitter:image', image);

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
