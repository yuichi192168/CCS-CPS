"use client";

import { useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { doc } from "firebase/firestore";
import { ArrowLeft, Mail, Loader2 } from "lucide-react";
import { AppHeader } from "@/components/layout/app-header";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { SidebarInset } from "@/components/ui/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useDoc, useFirestore } from "@/firebase";

const CCS_LOGO = "https://i.imgur.com/c2ywZT7.png";

export default function FacultyProfileClient() {
  const router = useRouter();
  const db = useFirestore();
  const searchParams = useSearchParams();
  const facultyId = (searchParams.get("id") || "").trim();

  const facultyRef = useMemo(() => {
    if (!db || !facultyId) return null;
    return doc(db, "faculty", facultyId);
  }, [db, facultyId]);

  const { data: faculty, loading } = useDoc(facultyRef);

  const goBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
      return;
    }
    router.push("/faculty");
  };

  return (
    <>
      <AppSidebar />
      <SidebarInset>
        <AppHeader />
        <main className="flex-1 p-4 md:p-6 lg:p-8">
          <div className="mx-auto w-full max-w-4xl">
            <Button variant="outline" size="sm" className="mb-4 gap-2" onClick={goBack}>
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>

            {!facultyId ? (
              <Card>
                <CardContent className="p-6 text-center text-muted-foreground">No faculty profile found.</CardContent>
              </Card>
            ) : loading ? (
              <Card>
                <CardContent className="flex h-40 items-center justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </CardContent>
              </Card>
            ) : !faculty ? (
              <Card>
                <CardContent className="p-6 text-center text-muted-foreground">Faculty profile not found.</CardContent>
              </Card>
            ) : (
              <Card className="border-none shadow-sm ring-1 ring-border">
                <CardHeader className="border-b">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                    <Avatar className="h-20 w-20 border-4 border-background ring-2 ring-primary/10">
                      <AvatarImage src={(faculty as any).image || CCS_LOGO} alt={(faculty as any).name} />
                      <AvatarFallback>{(faculty as any).name?.[0] || "F"}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <CardTitle className="text-2xl font-bold">{(faculty as any).name}</CardTitle>
                      <p className="text-sm text-muted-foreground">{(faculty as any).email}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 p-6">
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div className="rounded-lg border bg-muted/20 p-3">
                      <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Role / Rank</div>
                      <div className="mt-1 text-sm">{(faculty as any).role || "-"}</div>
                    </div>
                    <div className="rounded-lg border bg-muted/20 p-3">
                      <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Specialization</div>
                      <div className="mt-1 text-sm">{(faculty as any).specialization || "-"}</div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">{(faculty as any).publications || 0} Publications</Badge>
                    <Badge variant="outline">Active Researcher</Badge>
                  </div>

                  <Button asChild className="gap-2">
                    <a href={`mailto:${(faculty as any).email}`}>
                      <Mail className="h-4 w-4" />
                      Contact Faculty
                    </a>
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </main>
      </SidebarInset>
    </>
  );
}
