import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { QrCode } from "lucide-react";

export function StudentInfo() {
  return (
    <div className="flex flex-1 items-center justify-center w-full">
      <Card className="w-full max-w-md shadow-lg text-center">
        <CardHeader>
            <div className="mx-auto bg-accent rounded-full h-20 w-20 flex items-center justify-center mb-4">
                <QrCode className="h-12 w-12 text-accent-foreground" />
            </div>
          <CardTitle className="text-3xl font-headline">Ready to Join?</CardTitle>
          <CardDescription>To mark your attendance, please scan the QR code provided by your lecturer.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Once you scan the code, you'll be redirected to a page to enter your name.</p>
        </CardContent>
      </Card>
    </div>
  );
}
