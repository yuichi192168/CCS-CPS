"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { useCollection, useDoc, useFirestore } from "@/firebase";
import { collection, doc, limit, query, where } from "firebase/firestore";
import StudentProfile from "../profile";

export default function StudentProfileClient() {
  const db = useFirestore();
  const searchParams = useSearchParams();
  const studentId = (searchParams.get("id") || "").trim();

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

  if (!studentId) return <div>No student found.</div>;
  if (loadingByField || loadingByDocId) return <div>Loading...</div>;

  const student = (students && students.length > 0 ? students[0] : null) || studentByDocId;
  return <StudentProfile student={student} />;
}
