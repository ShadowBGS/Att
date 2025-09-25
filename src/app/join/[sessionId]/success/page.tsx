import { StudentSuccess } from "@/components/student-success"

export default function SuccessPage({ params }: { params: { lecturerId: string; sessionId: string } }) {
    return <StudentSuccess />
}

    