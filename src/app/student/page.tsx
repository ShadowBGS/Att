import { StudentInfo } from '@/components/student-info';
import { Card, CardHeader } from '@/components/ui/card';

export default function StudentPage() {
  return (
    <div className="flex flex-1 items-center justify-center w-full">
        <Card className="w-full max-w-md shadow-lg text-center">
            <CardHeader>
                <StudentInfo />
            </CardHeader>
        </Card>
    </div>
  );
}
