"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Users, QrCode, PlayCircle, StopCircle, UserCheck, BarChart, Clock, GraduationCap } from 'lucide-react';
import { doc, setDoc, serverTimestamp, collection, onSnapshot, deleteDoc, query, orderBy } from 'firebase/firestore';
import { useFirestore, useAuth, useUser } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { signInAnonymously } from 'firebase/auth';

const SESSION_KEY_PREFIX = 'classconnect_session_id_';

interface Student {
  id: string;
  name: string;
  joinTime: Date;
}

export function LecturerDashboard() {
  const firestore = useFirestore();
  const auth = useAuth();
  const { user: lecturer, isUserLoading } = useUser();
  const { toast } = useToast();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [isClient, setIsClient] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    setIsClient(true);
    if (auth && !lecturer && !isUserLoading) {
      signInAnonymously(auth).catch((error) => {
        console.error("Anonymous sign-in failed:", error);
        toast({
          title: "Authentication Failed",
          description: "Could not log in anonymously. Please refresh the page.",
          variant: "destructive",
        });
      });
    }
  }, [auth, lecturer, isUserLoading, toast]);

  useEffect(() => {
    if (lecturer) {
      const storedSessionId = localStorage.getItem(SESSION_KEY_PREFIX + lecturer.uid);
      if (storedSessionId) {
        setSessionId(storedSessionId);
      }
    }
  }, [lecturer]);

  useEffect(() => {
    if (!sessionId || !firestore || !lecturer) {
      setSessionStartTime(null);
      setStudents([]);
      return;
    }

    const sessionRef = doc(firestore, 'users', lecturer.uid, 'classSessions', sessionId);
    const unsubscribeSession = onSnapshot(sessionRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.startTime) {
          setSessionStartTime(data.startTime.toDate());
        }
      } else {
        setSessionId(null);
        if (lecturer) {
          localStorage.removeItem(SESSION_KEY_PREFIX + lecturer.uid);
        }
      }
    });

    const studentsQuery = query(collection(firestore, 'users', lecturer.uid, 'classSessions', sessionId, 'attendanceRecords'), orderBy('timestamp', 'asc'));
    const unsubscribeStudents = onSnapshot(studentsQuery, (querySnapshot) => {
        const studentList: Student[] = [];
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            studentList.push({
                id: doc.id,
                name: data.studentName,
                joinTime: data.timestamp?.toDate() || new Date(),
            });
        });
        setStudents(studentList);
    });

    return () => {
      unsubscribeSession();
      unsubscribeStudents();
    };
  }, [sessionId, firestore, lecturer]);
  
  useEffect(() => {
    if (isClient && sessionId && lecturer) {
      const joinUrl = `${window.location.origin}/join/${lecturer.uid}/${sessionId}`;
      setQrCodeUrl(`https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(joinUrl)}&size=256x256&bgcolor=f0f0f0`);
    } else {
      setQrCodeUrl('');
    }
  }, [sessionId, isClient, lecturer]);

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


  const startClass = async () => {
    if (!firestore || !lecturer) {
      toast({
        title: "Error",
        description: "Not authenticated or database connection failed. Please try again.",
        variant: "destructive"
      });
      return;
    }
    const newSessionRef = doc(collection(firestore, 'users', lecturer.uid, 'classSessions'));
    const newSessionId = newSessionRef.id;
    
    try {
      await setDoc(newSessionRef, {
        startTime: serverTimestamp(),
        active: true,
      });
      localStorage.setItem(SESSION_KEY_PREFIX + lecturer.uid, newSessionId);
      setSessionId(newSessionId);
    } catch (error) {
      console.error("Error starting class:", error);
      toast({
        title: "Failed to start session",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    }
  };

  const endClass = async () => {
    if (sessionId && firestore && lecturer) {
      try {
        const sessionRef = doc(firestore, 'users', lecturer.uid, 'classSessions', sessionId);
        await deleteDoc(sessionRef); 
      } catch (error) {
         console.error("Error ending class:", error);
          toast({
            title: "Failed to end session",
            description: "An unexpected error occurred. Please try again.",
            variant: "destructive"
        });
      }
    }
    if (lecturer) {
        localStorage.removeItem(SESSION_KEY_PREFIX + lecturer.uid);
    }
    setSessionId(null);
    setStudents([]);
    setSessionStartTime(null);
  };

  const formatTime = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  if (!isClient || isUserLoading) {
    return (
        <div className="flex items-center justify-center flex-1">
            <p>Loading...</p>
        </div>
    );
  }

  return (
    <>
      {!sessionId ? (
        <div className="space-y-8">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
            <div>
              <h1 className="text-3xl font-bold font-headline">Lecturer Dashboard</h1>
              <p className="text-muted-foreground">Welcome! Start a new session to begin taking attendance.</p>
            </div>
            <Button size="lg" className="w-full sm:w-auto bg-accent text-accent-foreground hover:bg-accent/90" onClick={startClass} disabled={!lecturer}>
              <PlayCircle className="mr-2" /> Start Class Session
            </Button>
          </div>
          <div className="flex flex-1 items-center justify-center text-center p-4">
            <Card className="w-full max-w-2xl shadow-lg">
              <CardHeader>
                <div className="mx-auto bg-primary rounded-full h-20 w-20 flex items-center justify-center mb-4">
                  <GraduationCap className="h-12 w-12 text-primary-foreground" />
                </div>
                <CardTitle className="text-3xl font-headline">Ready to start your class?</CardTitle>
                <CardDescription className="text-lg">Click the "Start Class Session" button to generate a QR code and begin tracking attendance in real-time.</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Once a session is active, you will see the session details, QR code, and a live list of attendees here.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                        {students.map((student) => (
                          <li key={student.id} className="flex items-center gap-4 p-3 bg-secondary rounded-lg animate-fade-in">
                            <UserCheck className="h-6 w-6 text-accent" />
                            <span className="text-lg text-secondary-foreground">{student.name}</span>
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
      )}
    </>
  );
}

    