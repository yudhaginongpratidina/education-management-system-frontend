// icons
import { GalleryVerticalEnd } from 'lucide-react';

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <>
            <div className="w-full min-h-screen flex flex-col items-center justify-center gap-4">
                <a href="#" className="flex items-center gap-2 self-center font-medium">
                    <div className="flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
                        <GalleryVerticalEnd className="size-4" />
                    </div>
                    Acme Inc.
                </a>
                {children}
            </div>
        </>
    );
}
