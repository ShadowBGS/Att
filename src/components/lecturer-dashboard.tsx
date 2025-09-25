"use client";

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Users, QrCode, PlayCircle, StopCircle, UserCheck } from 'lucide-react';

const SESSION_KEY = 'classconnect_session_id';

export function LecturerDashboard() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [students, setStudents] = useState<string[]>([]);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const storedSessionId = localStorage.getItem(SESSION_KEY);
    if (storedSessionId) {
      setSessionId(storedSessionId);
    }
  }, []);

  const updateStudentList = useCallback((id: string | null) => {
    if (!id) {
      setStudents([]);
      return;
    }
    const studentList = localStorage.getItem(`students-${id}`);
    if (studentList) {
      setStudents(JSON.parse(studentList));
    } else {
      setStudents([]);
    }
  }, []);

  useEffect(() => {
    if (isClient && sessionId) {
      const joinUrl = `${window.location.origin}/join/${sessionId}`;
      setQrCodeUrl(`https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(joinUrl)}&size=256x256&bgcolor=f0f0f0`);
      updateStudentList(sessionId);
    } else {
      setQrCodeUrl('');
    }

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === `students-${sessionId}` && event.newValue) {
        setStudents(JSON.parse(event.newValue));
      }
      if (event.key === SESSION_KEY && !event.newValue) {
        setSessionId(null);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [sessionId, isClient, updateStudentList]);


  const startClass = () => {
    const newSessionId = crypto.randomUUID();
    localStorage.setItem(SESSION_KEY, newSessionId);
    localStorage.setItem(`students-${newSessionId}`, JSON.stringify([]));
    setSessionId(newSessionId);
  };

  const endClass = () => {
    localStorage.removeItem(`students-${sessionId}`);
    localStorage.removeItem(SESSION_KEY);
    setSessionId(null);
    setStudents([]);
  };

  if (!isClient) {
    return null; // or a loading skeleton
  }

  if (!sessionId) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center text-center p-4">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader>
            <CardTitle className="text-3xl font-headline">Welcome, Lecturer!</CardTitle>
            <CardDescription>Start a new class session to begin taking attendance.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button size="lg" className="w-full bg-accent text-accent-foreground hover:bg-accent/90" onClick={startClass}>
              <PlayCircle className="mr-2" /> Start Class Session
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-1">
        <Card className="shadow-lg sticky top-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl font-headline">
              <QrCode /> Session QR Code
            </CardTitle>
            <CardDescription>Students can scan this code to join the class.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            {qrCodeUrl ? (
              <Image src={qrCodeUrl} alt="Session QR Code" width={256} height={256} className="rounded-lg bg-white p-2" />
            ) : (
              <div className="w-64 h-64 bg-gray-200 rounded-lg animate-pulse" />
            )}
            <p className="text-sm text-muted-foreground break-all">Session ID: {sessionId}</p>
            <Button variant="destructive" className="w-full" onClick={endClass}>
              <StopCircle className="mr-2" /> End Session
            </Button>
          </CardContent>
        </Card>
      </div>
      <div className="lg:col-span-2">
        <Card className="shadow-lg h-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl font-headline">
              <Users /> Attendees ({students.length})
            </CardTitle>
            <CardDescription>A real-time list of students who have marked their attendance.</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[60vh] pr-4">
              {students.length > 0 ? (
                <ul className="space-y-3">
                  {students.map((student, index) => (
                    <li key={index} className="flex items-center gap-4 p-3 bg-secondary rounded-lg animate-fade-in">
                      <UserCheck className="h-6 w-6 text-accent" />
                      <span className="text-lg text-secondary-foreground">{student}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-8">
                  <Users className="h-16 w-16 mb-4" />
                  <p className="text-lg">No students have joined yet.</p>
                  <p>Attendees will appear here once they scan the QR code.</p>
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
