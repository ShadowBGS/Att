"use client";

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Users, QrCode, PlayCircle, StopCircle, UserCheck, BarChart, Clock } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

const SESSION_KEY = 'classconnect_session_id';

export function LecturerDashboard() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [students, setStudents] = useState<string[]>([]);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [isClient, setIsClient] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    setIsClient(true);
    const storedSessionId = localStorage.getItem(SESSION_KEY);
    const storedStartTime = localStorage.getItem(`session_start_time_${storedSessionId}`);
    if (storedSessionId) {
      setSessionId(storedSessionId);
      if (storedStartTime) {
        setSessionStartTime(new Date(storedStartTime));
      }
    }
  }, []);

  useEffect(() => {
    if (!sessionStartTime) {
      setElapsedTime(0);
      return;
    }
    const interval = setInterval(() => {
      setElapsedTime(Math.floor((new Date().getTime() - sessionStartTime.getTime()) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [sessionStartTime]);


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
    const startTime = new Date();
    localStorage.setItem(SESSION_KEY, newSessionId);
    localStorage.setItem(`students-${newSessionId}`, JSON.stringify([]));
    localStorage.setItem(`session_start_time_${newSessionId}`, startTime.toISOString());
    setSessionId(newSessionId);
    setSessionStartTime(startTime);
  };

  const endClass = () => {
    if (sessionId) {
      localStorage.removeItem(`students-${sessionId}`);
      localStorage.removeItem(`session_start_time_${sessionId}`);
    }
    localStorage.removeItem(SESSION_KEY);
    setSessionId(null);
    setStudents([]);
    setSessionStartTime(null);
  };

  const formatTime = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
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
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
          <h1 className="text-3xl font-bold font-headline">Session Dashboard</h1>
          <p className="text-muted-foreground">Session ID: <span className="font-mono bg-muted px-2 py-1 rounded-md text-sm">{sessionId}</span></p>
        </div>
        <Button variant="destructive" className="w-full sm:w-auto" onClick={endClass}>
          <StopCircle className="mr-2" /> End Session
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Attendees</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{students.length}</div>
            <p className="text-xs text-muted-foreground">Students currently in session</p>
          </CardContent>
        </Card>
        <Card className="shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Session Status</CardTitle>
            <BarChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">Active</div>
            <p className="text-xs text-muted-foreground">Session is currently running</p>
          </CardContent>
        </Card>
        <Card className="shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Time Elapsed</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatTime(elapsedTime)}</div>
            <p className="text-xs text-muted-foreground">Duration of the current session</p>
          </CardContent>
        </Card>
      </div>
      
      <div className="w-full grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <Card className="shadow-lg sticky top-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl font-headline">
                <QrCode /> Session QR Code
              </CardTitle>
              <CardDescription>Students can scan this code to join.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4">
              {qrCodeUrl ? (
                <Image src={qrCodeUrl} alt="Session QR Code" width={256} height={256} className="rounded-lg bg-white p-2" />
              ) : (
                <div className="w-64 h-64 bg-gray-200 rounded-lg animate-pulse" />
              )}
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-2">
          <Card className="shadow-lg h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl font-headline">
                <Users /> Attendees
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
    </div>
  );
}

    