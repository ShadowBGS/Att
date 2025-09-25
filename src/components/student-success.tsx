"use client";

import { useState, useEffect } from "react";
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Home } from "lucide-react";

export function StudentSuccess() {
  const [studentName, setStudentName] = useState<string>('');

  useEffect(() => {
    const name = localStorage.getItem('classconnect_student_name');
    setStudentName(name || 'Student');
  }, []);

  return (
    <div className="flex flex-1 items-center justify-center text-center">
      <Card className="w-full max-w-md shadow-lg animate-fade-in">
        <CardHeader>
            <div className="mx-auto bg-primary rounded-full h-20 w-20 flex items-center justify-center mb-4">
                <CheckCircle className="h-12 w-12 text-primary-foreground" />
            </div>
          <CardTitle className="text-3xl font-headline">Attendance Marked!</CardTitle>
          <CardDescription className="text-lg">
            Welcome, <span className="font-bold text-primary">{studentName}</span>! Your attendance has been confirmed.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild variant="outline">
            <Link href="/">
                <Home className="mr-2" />
                Back to Home
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
