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

const FormSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
})

export function StudentJoinForm({ sessionId }: { sessionId: string }) {
  const router = useRouter()
  const { toast } = useToast()
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: "",
    },
  })

  function onSubmit(data: z.infer<typeof FormSchema>) {
    if (!isClient) return

    try {
      const studentListKey = `students-${sessionId}`;
      const studentListJSON = localStorage.getItem(studentListKey);
      
      // If session doesn't exist, it might have been closed by the lecturer.
      if (studentListJSON === null) {
          toast({
              title: "Error: Session not found",
              description: "The class session may have ended. Please check with your lecturer.",
              variant: "destructive",
          })
          return;
      }

      const studentList: string[] = JSON.parse(studentListJSON);
      
      if (studentList.includes(data.name)) {
        toast({
          title: "Already Registered",
          description: "Your attendance has already been marked for this session.",
        });
      } else {
        const updatedList = [...studentList, data.name];
        localStorage.setItem(studentListKey, JSON.stringify(updatedList));
        localStorage.setItem('classconnect_student_name', data.name);
      }

      router.push(`/join/${sessionId}/success`);

    } catch (error) {
      console.error("Failed to update attendance:", error);
      toast({
        title: "An error occurred",
        description: "Could not mark attendance. Please try again.",
        variant: "destructive",
      })
    }
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
                        <Button type="submit" className="w-full bg-accent text-accent-foreground hover:bg-accent/90" size="lg">
                            <UserPlus className="mr-2" /> Mark My Attendance
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    </div>
  )
}
