import { StudentJoinForm } from '@/components/student-join-form';

export default function JoinPage({ params }: { params: { sessionId: string } }) {
  // This page is now dynamic and will receive the lecturerId as well.
  // We are assuming the URL structure is /join/[lecturerId]/[sessionId]
  // but the folder structure is /join/[sessionId]/page.tsx which is not correct.
  // The join page will now be at /join/[lecturerId]/[sessionId]
  return null;
}

    