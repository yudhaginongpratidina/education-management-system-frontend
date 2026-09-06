'use client';

import { cn } from '@/lib/utils';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Button } from './button';
// import { Button } from '@/components/button';
// import { cn } from '@/shared/utils/cn';

type CameraProps = {
    facingMode?: 'user' | 'environment';
    onCapture?: (file: File, preview: string) => void;
    onReset?: () => void;
    className?: string;
    autoStart?: boolean;
};

export function Camera({
    facingMode = 'environment',
    onCapture,
    onReset,
    className,
    autoStart = true,
}: CameraProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const streamRef = useRef<MediaStream | null>(null);

    const [stream, setStream] = useState<MediaStream | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [facing, setFacing] = useState<'user' | 'environment'>(facingMode);
    const [localPreview, setLocalPreview] = useState<string | null>(null);

    const stopCamera = useCallback(() => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => track.stop());
            streamRef.current = null;
        }
        setStream(null);
    }, []);

    const startCamera = useCallback(async () => {
        setError(null);
        setLocalPreview(null);
        // Stop any existing stream first
        if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => track.stop());
            streamRef.current = null;
        }

        if (typeof window === 'undefined') return;

        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            setError('Camera is not supported or requires a secure connection (HTTPS).');
            return;
        }

        try {
            setIsLoading(true);

            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: facing,
                },
            });

            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
                videoRef.current.onloadedmetadata = () => {
                    videoRef.current?.play().catch((e) => {
                        console.error('Error playing video:', e);
                    });
                };
            }

            streamRef.current = mediaStream;
            setStream(mediaStream);
        } catch (err: any) {
            console.error('Error starting camera:', err);
            if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
                setError(
                    'Camera permission was denied. Please allow camera access in your browser settings.',
                );
            } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
                setError('No camera device found.');
            } else {
                setError(`Failed to open camera: ${err.message || err}`);
            }
        } finally {
            setIsLoading(false);
        }
    }, [facing]);

    const capture = useCallback(async () => {
        if (!videoRef.current || !canvasRef.current || !onCapture) {
            return;
        }

        const video = videoRef.current;
        const canvas = canvasRef.current;

        const width = video.videoWidth || 640;
        const height = video.videoHeight || 480;

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');

        if (!ctx) return;

        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        const blob = await new Promise<Blob | null>((resolve) =>
            canvas.toBlob(resolve, 'image/jpeg', 0.9),
        );

        if (!blob) return;

        const file = new File([blob], `capture-${Date.now()}.jpg`, {
            type: 'image/jpeg',
        });

        const preview = URL.createObjectURL(blob);

        setLocalPreview(preview);
        stopCamera();
        onCapture(file, preview);
    }, [onCapture, stopCamera]);

    const handleRetake = useCallback(() => {
        setLocalPreview(null);
        onReset?.();
        startCamera();
    }, [startCamera, onReset]);

    const toggleFacingMode = useCallback(() => {
        setFacing((prev) => (prev === 'user' ? 'environment' : 'user'));
    }, []);

    useEffect(() => {
        if (autoStart) {
            startCamera();
        }
        return () => {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach((track) => track.stop());
            }
        };
    }, [autoStart, startCamera]);

    return (
        <div className={cn('flex flex-col items-center w-full mx-auto', className)}>
            {/* Camera View Area */}
            <div className="relative w-full aspect-video rounded-sm overflow-hidden bg-black shadow-md">
                {localPreview ? (
                    <img
                        src={localPreview}
                        alt="Captured preview"
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className={cn('w-full h-full object-cover', !stream && 'hidden')}
                    />
                )}

                {!localPreview && !stream && !isLoading && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 p-4">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="h-12 w-12 mb-2 text-slate-500"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z"
                            />
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z"
                            />
                        </svg>
                        <p className="text-sm font-medium">Camera is turned off</p>
                        <p className="text-xs text-slate-500 mt-1">Click "Start Camera" to begin</p>
                    </div>
                )}

                {isLoading && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/80 text-white">
                        <div className="animate-spin rounded-sm h-8 w-8 border-b-2 border-white mb-2" />
                        <p className="text-sm">Opening camera...</p>
                    </div>
                )}
            </div>

            {/* Error Message Display */}
            {error && (
                <div className="w-full mt-3 p-3 bg-red-50 border border-red-200 text-red-600 rounded-sm text-sm text-center">
                    {error}
                </div>
            )}

            <canvas ref={canvasRef} className="hidden" />

            {/* Camera Controls */}
            <div className="mt-4 w-full flex flex-wrap gap-2 justify-center">
                {localPreview ? (
                    <Button
                        type="button"
                        onClick={handleRetake}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white"
                    >
                        Ambil Ulang (Retake)
                    </Button>
                ) : !stream ? (
                    <Button
                        type="button"
                        onClick={startCamera}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white"
                    >
                        Start Camera
                    </Button>
                ) : (
                    <div className="w-full flex gap-4">
                        <Button
                            type="button"
                            onClick={capture}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white"
                        >
                            Capture Photo
                        </Button>

                        <Button
                            type="button"
                            onClick={toggleFacingMode}
                            className="bg-zinc-600 hover:bg-zinc-700 text-white"
                        >
                            Switch Camera
                        </Button>

                        <Button
                            type="button"
                            onClick={stopCamera}
                            className="bg-rose-600 hover:bg-rose-700 text-white"
                        >
                            Stop
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
