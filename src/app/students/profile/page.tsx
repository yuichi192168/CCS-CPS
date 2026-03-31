import { useSearchParams } from "next/navigation";
import { useCollection } from "@/firebase";
import StudentProfile from "./profile";

export default function StudentProfilePage() {
  const searchParams = useSearchParams();
  const studentId = searchParams.get("id");
  const { data: students, loading } = useCollection();
  if (loading) return <div>Loading...</div>;
  const student = students?.find((s: any) => s.id === studentId);
  return <StudentProfile student={student} />;
}
