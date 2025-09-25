import { StudentJoinForm } from '@/components/student-join-form';

export default function JoinPage({ params }: { params: { lecturerId: string; sessionId: string } }) {
  return <StudentJoinForm lecturerId={params.lecturerId} sessionId={params.sessionId} />;
}

    