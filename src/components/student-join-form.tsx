"use client";

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { UserPlus } from "lucide-react";
import { useEffect, useState } from "react";
import { useFirestore, useAuth, useUser } from "@/firebase";
import { doc, getDoc, collection, addDoc, serverTimestamp, query, where, getDocs } from "firebase/firestore";
import { signInAnonymously } from "firebase/auth";

const FormSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
})

export function StudentJoinForm({ lecturerId, sessionId }: { lecturerId: string; sessionId: string }) {
  const router = useRouter()
  const firestore = useFirestore();
  const auth = useAuth();
  const { user: student, isUserLoading } = useUser();
  const { toast } = useToast()
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
    if (auth && !student && !isUserLoading) {
      signInAnonymously(auth).catch((error) => {
        console.error("Anonymous sign-in failed:", error);
        toast({
          title: "Authentication Failed",
          description: "Could not log in to join the session.",
          variant: "destructive",
        });
      });
    }
  }, [auth, student, isUserLoading, toast]);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: "",
    },
  })

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    if (!isClient || !firestore || !student) {
        toast({
            title: "Error",
            description: "Could not connect to the session. Please refresh and try again.",
            variant: "destructive",
        })
        return
    }

    try {
      const sessionRef = doc(firestore, 'users', lecturerId, 'classSessions', sessionId);
      const sessionSnap = await getDoc(sessionRef);

      if (!sessionSnap.exists()) {
          toast({
              title: "Error: Session not found",
              description: "The class session may have ended. Please check with your lecturer.",
              variant: "destructive",
          })
          return;
      }

      const studentsRef = collection(firestore, 'users', lecturerId, 'classSessions', sessionId, 'attendanceRecords');
      
      // Use student UID to check for existing record
      const studentDocRef = doc(studentsRef, student.uid);
      const studentDocSnap = await getDoc(studentDocRef);


      if (studentDocSnap.exists()) {
        toast({
          title: "Already Registered",
          description: "Your attendance has already been marked for this session.",
        });
      } else {
        await addDoc(studentsRef, {
            studentName: data.name,
            studentId: student.uid,
            timestamp: serverTimestamp()
        });
        localStorage.setItem('classconnect_student_name', data.name);
      }

      router.push(`/join/${lecturerId}/${sessionId}/success`);

    } catch (error) {
      console.error("Failed to update attendance:", error);
      toast({
        title: "An error occurred",
        description: "Could not mark attendance. Please try again.",
        variant: "destructive",
      })
    }
  }
  
  if (isUserLoading || !isClient) {
    return (
        <div className="flex flex-1 items-center justify-center w-full">
            <p>Loading session...</p>
        </div>
    )
  }

  return (
    <div className="flex flex-1 items-center justify-center w-full">
        <Card className="w-full max-w-md shadow-lg">
            <CardHeader>
                <CardTitle className="text-3xl font-headline">Join Class Session</CardTitle>
                <CardDescription>Enter your full name to mark your attendance.</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Full Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g. Jane Doe" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit" className="w-full bg-accent text-accent-foreground hover:bg-accent/90" size="lg" disabled={!student}>
                            <UserPlus className="mr-2" /> Mark My Attendance
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    </div>
  )
}
