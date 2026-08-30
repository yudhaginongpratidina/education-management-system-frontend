import { useEffect, useState } from 'react';
import { http } from '@/lib/http';

export default function TeacherPhoto({ slug }: { slug: string }) {
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!slug || slug === '-') {
            setLoading(false);
            return;
        }

        const fetchImage = async () => {
            try {
                // Assuming the API returns the image as a blob or data URL
                // If it returns a direct URL, we can use that.
                // Based on the requirement, it's an endpoint to fetch the file content.
                const response = await http.get(`/storage/${slug}`, {
                    responseType: 'blob',
                });
                const url = URL.createObjectURL(response.data);
                setImageUrl(url);
            } catch (error) {
                console.error('Error fetching image', error);
                setImageUrl(null);
            } finally {
                setLoading(false);
            }
        };

        fetchImage();

        return () => {
            if (imageUrl) URL.revokeObjectURL(imageUrl);
        };
    }, [slug]);

    if (loading) return <span>Loading...</span>;
    if (!imageUrl) return <span>-</span>;

    return <img src={imageUrl} alt="Teacher" className="size-10 rounded-full object-cover" />;
}
