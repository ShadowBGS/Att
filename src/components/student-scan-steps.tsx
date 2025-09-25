"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, Wifi, WifiOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { StudentInfo } from './student-info';

type Step = 'proximity_check' | 'qr_scan';

const BLUETOOTH_SERVICE_UUID = '0000180a-0000-1000-8000-00805f9b34fb';

export function StudentScanSteps() {
  const [step, setStep] = useState<Step>('proximity_check');
  const [nearbySession, setNearbySession] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const { toast } = useToast();
  const scanController = useRef<AbortController | null>(null);

  const stopScan = useCallback(() => {
    if (scanController.current) {
      scanController.current.abort();
      scanController.current = null;
    }
    setIsScanning(false);
  }, []);

  const startScan = useCallback(async () => {
    if (!navigator.bluetooth) {
      toast({
        variant: 'destructive',
        title: 'Bluetooth Not Supported',
        description: 'Your browser does not support Web Bluetooth. Proximity check is unavailable.',
      });
      return;
    }

    const isBluetoothEnabled = await navigator.bluetooth.getAvailability();
    if (!isBluetoothEnabled) {
      toast({
        variant: 'destructive',
        title: 'Bluetooth is turned off',
        description: 'Please turn on Bluetooth to find nearby classes.',
      });
      return;
    }

    if (isScanning) return;

    setIsScanning(true);
    setNearbySession(null);

    try {
      scanController.current = new AbortController();

      const device = await navigator.bluetooth.requestDevice({
        filters: [{ services: [BLUETOOTH_SERVICE_UUID] }],
        optionalServices: [BLUETOOTH_SERVICE_UUID],
      });

      const deviceName = device.name || '';
      if (deviceName.startsWith('ClassConnect:')) {
        const sessionId = deviceName.split(':')[1];
        setNearbySession(sessionId);
        toast({
          title: 'Class Found!',
          description: 'A nearby class session has been detected. You can now proceed.',
        });
      } else {
         setNearbySession(null);
      }
    } catch (error: any) {
      if (error.name !== 'NotFoundError' && error.name !== 'AbortError') {
        console.error('Bluetooth scan error:', error);
        toast({
          variant: 'destructive',
          title: 'Scan Error',
          description: 'Could not scan for devices. Make sure you grant the required permissions.',
        });
      }
    } finally {
      setIsScanning(false);
    }
  }, [toast, isScanning]);

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      stopScan();
    };
  }, [stopScan]);

  return (
    <div className="flex flex-1 items-center justify-center w-full">
      <Card className="w-full max-w-md shadow-lg text-center">
        <CardHeader>
          {step === 'proximity_check' && (
            <>
              <div className="mx-auto bg-primary rounded-full h-20 w-20 flex items-center justify-center mb-4">
                <Wifi className="h-12 w-12 text-primary-foreground" />
              </div>
              <CardTitle className="text-3xl font-headline">Find Nearby Class</CardTitle>
              <CardDescription>
                Scan for your lecturer's signal to ensure you're in the classroom.
              </CardDescription>
            </>
          )}
        </CardHeader>
        <CardContent className="p-4">
          {step === 'proximity_check' ? (
            <div className="flex flex-col items-center gap-4">
              <Button onClick={startScan} disabled={isScanning} size="lg" className="w-full">
                {isScanning ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Scanning...
                  </>
                ) : (
                  'Scan for Class'
                )}
              </Button>
              {nearbySession ? (
                 <div className="text-center p-4 bg-green-100 dark:bg-green-900/50 rounded-lg w-full">
                    <p className="font-bold text-green-700 dark:text-green-300">Class Found!</p>
                    <p className="text-sm text-muted-foreground">You can now proceed to scan the QR code.</p>
                     <Button onClick={() => setStep('qr_scan')} className="mt-4">
                        Proceed to QR Scan
                    </Button>
                </div>
              ) : (
                <div className="text-center p-4 bg-secondary rounded-lg w-full">
                    <WifiOff className="h-8 w-8 mx-auto text-muted-foreground mb-2"/>
                    <p className="font-bold">No Class Found</p>
                    <p className="text-sm text-muted-foreground">Please try scanning. Ensure your lecturer has started the session.</p>
                </div>
              )}
            </div>
          ) : (
            <StudentInfo />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
