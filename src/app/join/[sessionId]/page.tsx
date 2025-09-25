import { StudentJoinForm } from '@/components/student-join-form';

export default function JoinPage({ params }: { params: { sessionId: string } }) {
  return <StudentJoinForm sessionId={params.sessionId} />;
}
