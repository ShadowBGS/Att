"use client";

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import jsQR from 'jsqr';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { QrCode, VideoOff, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function StudentInfo() {
  const router = useRouter();
  const { toast } = useToast();
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const getCameraPermission = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setHasCameraPermission(true);
      } catch (error) {
        console.error('Error accessing camera:', error);
        setHasCameraPermission(false);
        toast({
          variant: 'destructive',
          title: 'Camera Access Denied',
          description: 'Please enable camera permissions in your browser settings to scan the QR code.',
        });
      }
    };

    getCameraPermission();

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [toast]);

  useEffect(() => {
    let animationFrameId: number;

    const tick = () => {
      if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA && canvasRef.current) {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        if (ctx) {
          canvas.height = video.videoHeight;
          canvas.width = video.videoWidth;
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: "dontInvert",
          });

          if (code) {
            try {
                const url = new URL(code.data);
                if (url.pathname.startsWith('/join/')) {
                    router.push(url.pathname);
                    return; // Stop scanning
                }
            } catch (error) {
                // Not a valid URL, ignore
            }
          }
        }
      }
      animationFrameId = requestAnimationFrame(tick);
    };

    if (hasCameraPermission) {
      animationFrameId = requestAnimationFrame(tick);
    }

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [hasCameraPermission, router]);

  return (
    <>
        <div className="mx-auto bg-accent rounded-full h-20 w-20 flex items-center justify-center mb-4">
        <QrCode className="h-12 w-12 text-accent-foreground" />
        </div>
        <CardTitle className="text-3xl font-headline">Scan to Join</CardTitle>
        <CardDescription>Point your camera at the QR code provided by your lecturer to mark your attendance.</CardDescription>
        <div className="relative aspect-video w-full bg-secondary rounded-lg overflow-hidden border mt-4">
        <video ref={videoRef} className="w-full h-full object-cover" autoPlay playsInline muted />
        <canvas ref={canvasRef} className="hidden" />

        {hasCameraPermission === false && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 text-white p-4">
            <VideoOff className="h-12 w-12 mb-4" />
            <p className="font-bold">Camera Access Denied</p>
            <p className="text-sm">Please enable camera permissions.</p>
            </div>
        )}
            {hasCameraPermission === null && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 text-white p-4">
                <p>Requesting camera access...</p>
            </div>
        )}
        </div>
    </>
  );
}
