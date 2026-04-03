"use client";

import { useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCollection, useDoc, useFirestore } from "@/firebase";
import { collection, doc, limit, query, where } from "firebase/firestore";
import StudentProfile from "../profile";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function StudentProfileClient() {
  const router = useRouter();
  const db = useFirestore();
  const searchParams = useSearchParams();
  const studentId = (searchParams.get("id") || "").trim();

  const goBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
      return;
    }
    router.push("/students");
  };

  const studentByIdQuery = useMemo(() => {
    if (!db || !studentId) return null;
    return query(collection(db, "students"), where("id", "==", studentId), limit(1));
  }, [db, studentId]);

  const directDocRef = useMemo(() => {
    if (!db || !studentId) return null;
    return doc(db, "students", studentId);
  }, [db, studentId]);

  const { data: students, loading: loadingByField } = useCollection(studentByIdQuery);
  const { data: studentByDocId, loading: loadingByDocId } = useDoc(directDocRef);

  if (!studentId) {
    return (
      <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
        <Button variant="outline" size="sm" className="mb-4 gap-2" onClick={goBack}>
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <div>No student found.</div>
      </div>
    );
  }

  if (loadingByField || loadingByDocId) {
    return (
      <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
        <Button variant="outline" size="sm" className="mb-4 gap-2" onClick={goBack}>
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <div>Loading...</div>
      </div>
    );
  }

  const student = (students && students.length > 0 ? students[0] : null) || studentByDocId;
  return (
    <div>
      <div className="mx-auto w-full max-w-5xl px-4 pt-6 sm:px-6 lg:px-8">
        <Button variant="outline" size="sm" className="mb-4 gap-2" onClick={goBack}>
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
      </div>
      <StudentProfile student={student} />
    </div>
  );
}
