
"use client"

import { useMemo } from "react";
import { AppHeader } from "@/components/layout/app-header";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { SidebarInset } from "@/components/ui/sidebar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Filter, Plus, MoreHorizontal, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useCollection, useFirestore } from "@/firebase";
import { collection, query, orderBy } from "firebase/firestore";

export default function StudentsPage() {
  const db = useFirestore();
  
  const studentsQuery = useMemo(() => {
    if (!db) return null;
    return query(collection(db, "students"), orderBy("name", "asc"));
  }, [db]);

  const { data: students, loading, error } = useCollection(studentsQuery);

  return (
    <>
      <AppSidebar />
      <SidebarInset>
        <AppHeader />
        <main className="flex-1 p-4 md:p-6 lg:p-8">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="font-headline text-3xl font-bold tracking-tight text-primary">Student Profiling</h1>
                <p className="text-muted-foreground">Manage and view comprehensive student academic records.</p>
              </div>
              <Button className="w-full sm:w-auto gap-2">
                <Plus className="h-4 w-4" />
                Enroll New Student
              </Button>
            </div>

            <Card className="shadow-sm border-none ring-1 ring-border">
              <CardHeader className="border-b pb-4">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="relative max-w-sm w-full">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search students by name, ID..." className="pl-9" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="gap-2">
                      <Filter className="h-4 w-4" />
                      Filters
                    </Button>
                    <Button variant="outline" size="sm">Export CSV</Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {loading ? (
                  <div className="flex h-32 items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : error ? (
                  <div className="p-8 text-center text-destructive">
                    Failed to load students. Please try again later.
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[120px]">Student ID</TableHead>
                        <TableHead>Student Name</TableHead>
                        <TableHead>Course</TableHead>
                        <TableHead>Year Level</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {students?.map((student: any) => (
                        <TableRow key={student.id} className="cursor-pointer hover:bg-muted/30">
                          <TableCell className="font-medium">{student.id}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={student.imageUrl || `https://picsum.photos/seed/${student.id}/40`} />
                                <AvatarFallback>{student.name[0]}</AvatarFallback>
                              </Avatar>
                              <div className="flex flex-col">
                                <span className="font-medium leading-none">{student.name}</span>
                                <span className="text-xs text-muted-foreground">{student.email}</span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{student.course}</TableCell>
                          <TableCell>{student.year}</TableCell>
                          <TableCell>
                            <Badge variant={student.status === "Active" ? "default" : student.status === "Graduated" ? "secondary" : "outline"} className={student.status === "Active" ? "bg-accent text-accent-foreground" : ""}>
                              {student.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                      {(!students || students.length === 0) && (
                        <TableRow>
                          <TableCell colSpan={6} className="h-24 text-center text-muted-foreground italic">
                            No students found in the database.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </SidebarInset>
    </>
  );
}
