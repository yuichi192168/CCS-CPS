"use client";

import { useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCollection, useDoc, useFirestore } from "@/firebase";
import { collection, doc, limit, query, where } from "firebase/firestore";
import StudentProfile from "../profile";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Image from "next/image";
import { Skeleton } from "@/components/ui/skeleton";

const CCS_LOGO = "https://i.imgur.com/c2ywZT7.png";

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

        <div className="mb-6 flex items-center gap-3 rounded-lg border bg-muted/20 p-3">
          <Image
            src={CCS_LOGO}
            alt="CCS logo"
            width={36}
            height={36}
            className="animate-pulse rounded-md"
            unoptimized
          />
          <div className="text-sm font-medium text-muted-foreground">Loading student record...</div>
        </div>

        <div className="space-y-4 rounded-lg border p-4">
          <div className="flex items-center gap-4">
            <Skeleton className="h-16 w-16 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-5 w-52" />
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>

          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
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
