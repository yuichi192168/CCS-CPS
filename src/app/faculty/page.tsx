
"use client"

import { useMemo } from "react";
import { AppHeader } from "@/components/layout/app-header";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { SidebarInset } from "@/components/ui/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mail, Search, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useCollection, useFirestore } from "@/firebase";
import { collection, query, orderBy } from "firebase/firestore";

export default function FacultyPage() {
  const db = useFirestore();

  const facultyQuery = useMemo(() => {
    if (!db) return null;
    return query(collection(db, "faculty"), orderBy("name", "asc"));
  }, [db]);

  const { data: faculty, loading, error } = useCollection(facultyQuery);

  return (
    <>
      <AppSidebar />
      <SidebarInset>
        <AppHeader />
        <main className="flex-1 p-4 md:p-6 lg:p-8">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="font-headline text-3xl font-bold tracking-tight text-primary">Faculty Profiles</h1>
                <p className="text-muted-foreground">Expert directory and specialization profiles.</p>
              </div>
              <div className="relative w-full sm:max-w-xs">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search faculty..." className="pl-9" />
              </div>
            </div>

            {loading ? (
              <div className="flex h-64 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : error ? (
              <div className="p-8 text-center text-destructive">
                Failed to load faculty members.
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {faculty?.map((member: any) => (
                  <Card key={member.name} className="overflow-hidden shadow-sm border-none ring-1 ring-border group hover:ring-accent transition-all duration-300">
                    <div className="h-24 bg-primary group-hover:bg-primary/90 transition-colors" />
                    <CardContent className="relative flex flex-col items-center p-6 pt-0">
                      <Avatar className="h-20 w-20 -mt-10 border-4 border-background ring-2 ring-primary/5 shadow-md">
                        <AvatarImage src={member.image} />
                        <AvatarFallback>{member.name[0]}</AvatarFallback>
                      </Avatar>
                      <div className="mt-4 text-center">
                        <h3 className="font-headline font-bold text-lg">{member.name}</h3>
                        <p className="text-sm text-accent font-medium">{member.role}</p>
                        <p className="text-xs text-muted-foreground mt-1">Specialization: {member.specialization}</p>
                      </div>
                      <div className="mt-4 flex flex-wrap justify-center gap-2">
                        <Badge variant="secondary" className="text-[10px]">{member.publications || 0} Publications</Badge>
                        <Badge variant="outline" className="text-[10px]">Active Researcher</Badge>
                      </div>
                      <div className="mt-6 flex w-full gap-2">
                        <Button variant="outline" size="sm" className="flex-1 gap-2">
                          <Mail className="h-3 w-3" />
                          Email
                        </Button>
                        <Button size="sm" className="flex-1">View Profile</Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {(!faculty || faculty.length === 0) && (
                  <div className="col-span-full py-20 text-center text-muted-foreground italic">
                    No faculty records found.
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </SidebarInset>
    </>
  );
}
