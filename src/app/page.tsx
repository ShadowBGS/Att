import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, User, GraduationCap } from 'lucide-react';

export default function RoleSelectionPage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center text-center p-4">
      <div className="mb-8">
        <h1 className="text-4xl font-bold font-headline text-foreground">Welcome to ClassConnect</h1>
        <p className="text-xl text-muted-foreground mt-2">Please select your role to continue.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
        <Card className="shadow-lg transform hover:scale-105 transition-transform duration-300">
          <CardHeader>
            <div className="mx-auto bg-primary rounded-full h-20 w-20 flex items-center justify-center mb-4">
                <GraduationCap className="h-12 w-12 text-primary-foreground" />
            </div>
            <CardTitle className="text-2xl font-headline">I am a Lecturer</CardTitle>
            <CardDescription>Start and manage your class sessions, and track attendance in real-time.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild size="lg" className="w-full">
              <Link href="/lecturer">
                Go to Dashboard <ArrowRight className="ml-2" />
              </Link>
            </Button>
          </CardContent>
        </Card>
        <Card className="shadow-lg transform hover:scale-105 transition-transform duration-300">
          <CardHeader>
            <div className="mx-auto bg-accent rounded-full h-20 w-20 flex items-center justify-center mb-4">
                <User className="h-12 w-12 text-accent-foreground" />
            </div>
            <CardTitle className="text-2xl font-headline">I am a Student</CardTitle>
            <CardDescription>Join a class session to mark your attendance quickly and easily.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild size="lg" variant="secondary" className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                <Link href="/student">
                    Join a Session <ArrowRight className="ml-2" />
                </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
