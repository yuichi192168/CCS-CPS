"use client"

import { useMemo, useState } from "react"
import { AppHeader } from "@/components/layout/app-header"
import { AppSidebar } from "@/components/layout/app-sidebar"
import { SidebarInset } from "@/components/ui/sidebar"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Filter, Plus, MoreHorizontal, Trash2, Loader2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useCollection, useFirestore } from "@/firebase"
import { useUserProfile } from "@/firebase/auth/use-user-profile"
import { collection, query, orderBy, setDoc, deleteDoc, doc, writeBatch } from "firebase/firestore"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { errorEmitter } from "@/firebase/error-emitter"
import { FirestorePermissionError } from "@/firebase/errors"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Skeleton } from "@/components/ui/skeleton"

const CCS_LOGO = "https://i.imgur.com/c2ywZT7.png"

export default function StudentsPage() {
  const [editStudent, setEditStudent] = useState<any | null>(null)
  const [viewMode, setViewMode] = useState<'table' | 'card' | 'list'>('table')
  const [formStatus, setFormStatus] = useState("Active")
  const router = useRouter()
  const db = useFirestore()
  const { profile } = useUserProfile()
  const { toast } = useToast()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isSeeding, setIsSeeding] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [skillFilter, setSkillFilter] = useState<string | null>(null)
  
  const isAdmin = profile?.role === 'admin'

  const studentsQuery = useMemo(() => {
    if (!db) return null
    return query(collection(db, "students"), orderBy("name", "asc"))
  }, [db])

  const { data: students, loading, error } = useCollection(studentsQuery)

  const filteredStudents = useMemo(() => {
    if (!students) return []
    let filtered = students.filter(s => 
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      s.id.toLowerCase().includes(searchTerm.toLowerCase())
    )
    if (skillFilter) {
      filtered = filtered.filter(s => Array.isArray(s.skills) && s.skills.map((sk: string) => sk.toLowerCase()).includes(skillFilter.toLowerCase()))
    }
    return filtered
  }, [students, searchTerm, skillFilter])

  const handleAddOrEditStudent = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!db) {
      toast({ title: "Database unavailable", description: "Firestore is not initialized.", variant: "destructive" })
      return
    }

    const formData = new FormData(e.currentTarget)
    const rawStudentId = (formData.get("studentId") as string) || editStudent?.id || ""
    const studentId = rawStudentId.trim()

    if (!studentId) {
      toast({ title: "Student ID is required", description: "Please enter a valid Student ID.", variant: "destructive" })
      return
    }

    if (studentId.includes("/")) {
      toast({
        title: "Invalid Student ID",
        description: "Student ID cannot contain '/'. Please use dashes instead.",
        variant: "destructive",
      })
      return
    }

    const studentData = {
      id: studentId,
      name: formData.get("name") as string,
      course: formData.get("course") as string,
      year: formData.get("year") as string,
      academicYear: formData.get("academicYear") as string,
      status: formStatus,
      email: formData.get("email") as string,
      imageUrl: CCS_LOGO,
      academicHistory: formData.get("academicHistory") as string,
      activities: formData.get("activities") as string,
      violations: formData.get("violations") as string,
      skills: (formData.get("skills") as string).split(",").map(s => s.trim()).filter(Boolean),
      affiliations: (formData.get("affiliations") as string).split(",").map(a => a.trim()).filter(Boolean),
    }

    const targetId = editStudent?.docId || studentId
    const studentRef = doc(db, "students", targetId)
    setDoc(studentRef, studentData, { merge: true })
      .then(() => {
        setIsDialogOpen(false)
        setEditStudent(null)
        setFormStatus("Active")
        toast({
          title: "Success",
          description: editStudent ? "Student record updated." : "Student enrolled successfully.",
        })
      })
      .catch(async (serverError: any) => {
        const permissionError = new FirestorePermissionError({
          path: studentRef.path,
          operation: editStudent ? "update" : "create",
          requestResourceData: studentData,
        })
        errorEmitter.emit("permission-error", permissionError)
        toast({
          title: "Save failed",
          description: serverError?.message || "Could not save student record.",
          variant: "destructive",
        })
      })
  }

  const handleDeleteStudent = (studentId: string) => {
    if (!db) return
    const studentRef = doc(db, "students", studentId)
    deleteDoc(studentRef)
      .then(() => {
        toast({ title: "Deleted", description: "Student record has been removed." })
      })
      .catch(async (error: any) => {
        const permissionError = new FirestorePermissionError({
          path: studentRef.path,
          operation: "delete",
        })
        errorEmitter.emit("permission-error", permissionError)
        toast({
          title: "Delete failed",
          description: error?.message || "Could not delete student record.",
          variant: "destructive",
        })
      })
  }

  const handleSeedSampleData = async () => {
    if (!db) {
      toast({ title: "Database unavailable", description: "Firestore is not initialized.", variant: "destructive" })
      return
    }

    setIsSeeding(true)

    const biniMembers = [
      "Aiah",
      "Colet",
      "Maloi",
      "Gwen",
      "Stacey",
      "Mikha",
      "Jhoanna",
      "Sheena",
    ]

    const sampleStudents = biniMembers.map((name, i) => ({
      id: `22033${(i + 1).toString().padStart(2, "0")}`,
      name: `${name} Salamin`,
      course: i % 2 === 0 ? "BSCS" : "BSIT",
      year: `${(i % 4) + 1} Year`,
      academicYear: "2025-2026",
      status: "Active",
      email: `${name.toLowerCase()}@pnc.edu.ph`,
      imageUrl: CCS_LOGO,
      academicHistory: "Senior High School - STEM track, with strong academic standing.",
      activities: i % 2 === 0 ? "Coding Club, Dance Troupe" : "Student Council, Debate Society",
      violations: "None",
      skills: i % 2 === 0 ? ["programming", "design"] : ["basketball", "communication"],
      affiliations: i % 2 === 0 ? ["CCS Tech Guild", "Campus Creatives"] : ["Intramurals Team", "Peer Mentors"],
    }))

    const sampleFaculty = biniMembers.slice(0, 6).map((name, i) => ({
      name: `Prof. ${name} Ramos`,
      role: i % 2 === 0 ? "Associate Professor" : "Assistant Professor",
      specialization: i % 2 === 0 ? "Software Engineering" : "Data Science",
      publications: 2 + i,
      email: `${name.toLowerCase()}.faculty@pnc.edu.ph`,
      image: "/images/suit-faculty.png",
    }))

    const currentYear = new Date().getFullYear()
    const sampleResearch = [
      {
        title: "BINI: Student-Centered UX Patterns for Campus Portals",
        authors: "Aiah, Colet, Maloi",
        year: String(currentYear),
        tags: ["UX", "Education", "Frontend"],
        citation: 3,
        abstract: "A study on usability and accessibility improvements for college information systems.",
      },
      {
        title: "Predictive Analytics for Student Success Using BINI Cohort Data",
        authors: "Mikha, Jhoanna, Stacey",
        year: String(currentYear - 1),
        tags: ["Analytics", "Machine Learning", "Academic Performance"],
        citation: 6,
        abstract: "This paper explores early-warning indicators for academic risk using school data.",
      },
      {
        title: "Event Recommendation Engine for Campus Activities",
        authors: "Gwen, Sheena",
        year: String(currentYear),
        tags: ["Recommender Systems", "Student Engagement"],
        citation: 2,
        abstract: "A lightweight recommendation model to increase student participation in co-curricular events.",
      },
    ]

    const sampleEvents = [
      { title: "BINI Tech Orientation 2026", date: "2026-06-10", time: "09:00 AM", location: "CCS Auditorium", type: "Academic" },
      { title: "BINI Code Jam", date: "2026-07-05", time: "01:00 PM", location: "Computer Lab 2", type: "Competition" },
      { title: "BINI Research Colloquium", date: "2026-08-14", time: "10:00 AM", location: "Innovation Hub", type: "Workshop" },
      { title: "BINI Sports and Wellness Day", date: "2026-09-03", time: "08:00 AM", location: "University Gym", type: "Administrative" },
    ]

    try {
      const batch = writeBatch(db)

      sampleStudents.forEach((student) => {
        const studentRef = doc(db, "students", student.id)
        batch.set(studentRef, student, { merge: true })
      })

      sampleFaculty.forEach((faculty, i) => {
        const facultyRef = doc(db, "faculty", `bini-faculty-${i + 1}`)
        batch.set(facultyRef, faculty, { merge: true })
      })

      sampleResearch.forEach((paper, i) => {
        const paperRef = doc(db, "research", `bini-research-${i + 1}`)
        batch.set(paperRef, paper, { merge: true })
      })

      sampleEvents.forEach((event, i) => {
        const eventRef = doc(db, "events", `bini-event-${i + 1}`)
        batch.set(eventRef, event, { merge: true })
      })

      await batch.commit()
      toast({
        title: "Sample data added",
        description: "Students, faculty, research papers, and events were populated successfully.",
      })
    } catch (serverError) {
      const permissionError = new FirestorePermissionError({
        path: "students|faculty|research|events",
        operation: "write",
      })
      errorEmitter.emit("permission-error", permissionError)
      toast({
        title: "Seeding failed",
        description: "Could not add sample records. Check your permissions.",
        variant: "destructive",
      })
    } finally {
      setIsSeeding(false)
    }
  }

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

              {isAdmin && (
                <Dialog
                  open={isDialogOpen}
                  onOpenChange={(open) => {
                    setIsDialogOpen(open)
                    if (!open) {
                      setEditStudent(null)
                      setFormStatus("Active")
                    }
                  }}
                >
                  <div className="flex flex-wrap gap-2">
                    {/* <Button
                      type="button"
                      variant="outline"
                      className="w-full sm:w-auto gap-2"
                      onClick={handleSeedSampleData}
                      disabled={isSeeding}
                    >
                      {isSeeding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Filter className="h-4 w-4" />}
                      Add BINI Sample Data
                    </Button> */}

                    <DialogTrigger asChild>
                      <Button
                        className="w-full sm:w-auto gap-2"
                        onClick={() => {
                          setEditStudent(null)
                          setFormStatus("Active")
                        }}
                      >
                        <Plus className="h-4 w-4" />
                        Enroll New Student
                      </Button>
                    </DialogTrigger>
                  </div>
                  <DialogContent className="sm:max-w-2xl">
                    <form onSubmit={handleAddOrEditStudent}>
                      <DialogHeader>
                        <DialogTitle>{editStudent ? "Edit Student" : "Enroll Student"}</DialogTitle>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                          <Label htmlFor="studentId">Student ID</Label>
                          <Input id="studentId" name="studentId" placeholder="2026-0001" required defaultValue={editStudent?.id || ""} disabled={!!editStudent} />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="name">Full Name</Label>
                          <Input id="name" name="name" placeholder="Mikha Lim" required defaultValue={editStudent?.name || ""} />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="email">Email Address</Label>
                          <Input id="email" name="email" type="email" placeholder="mikha@pnc.edu.ph" required defaultValue={editStudent?.email || ""} />
                        </div>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                          <div className="grid gap-2">
                            <Label htmlFor="course">Course / Strand</Label>
                            <Input id="course" name="course" placeholder="BSCS" required defaultValue={editStudent?.course || ""} />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="year">Year Level</Label>
                            <Input id="year" name="year" placeholder="3rd Year" required defaultValue={editStudent?.year || ""} />
                          </div>
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="academicYear">Academic Year</Label>
                          <Input id="academicYear" name="academicYear" placeholder="2025-2026" required defaultValue={editStudent?.academicYear || ""} />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="academicHistory">Academic History</Label>
                          <Input id="academicHistory" name="academicHistory" placeholder="Previous schools, grades, etc." defaultValue={editStudent?.academicHistory || ""} />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="activities">Non-Academic Activities</Label>
                          <Input id="activities" name="activities" placeholder="Clubs, events, extracurricular..." defaultValue={editStudent?.activities || ""} />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="violations">Violations</Label>
                          <Input id="violations" name="violations" placeholder="Disciplinary records..." defaultValue={editStudent?.violations || ""} />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="skills">Skills</Label>
                          <Input id="skills" name="skills" placeholder="programming, basketball, design (comma separated)" defaultValue={Array.isArray(editStudent?.skills) ? editStudent.skills.join(", ") : (editStudent?.skills || "")} />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="affiliations">Affiliations</Label>
                          <Input id="affiliations" name="affiliations" placeholder="Organizations, sports teams, groups (comma separated)" defaultValue={Array.isArray(editStudent?.affiliations) ? editStudent.affiliations.join(", ") : (editStudent?.affiliations || "")} />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="status">Status</Label>
                          <Select
                            value={formStatus}
                            onValueChange={setFormStatus}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Active">Active</SelectItem>
                              <SelectItem value="Graduated">Graduated</SelectItem>
                              <SelectItem value="On Leave">On Leave</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button type="submit">{editStudent ? "Update Student" : "Enroll Student"}</Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              )}
            </div>

            <div className="flex items-center gap-2 mb-2">
              <Button variant={viewMode === 'table' ? 'default' : 'outline'} size="sm" onClick={() => setViewMode('table')}>Table</Button>
              <Button variant={viewMode === 'card' ? 'default' : 'outline'} size="sm" onClick={() => setViewMode('card')}>Card</Button>
              <Button variant={viewMode === 'list' ? 'default' : 'outline'} size="sm" onClick={() => setViewMode('list')}>List</Button>
            </div>
            <Card className="shadow-sm border-none ring-1 ring-border overflow-hidden">
              <CardHeader className="border-b bg-muted/5 pb-4">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="relative max-w-sm w-full">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input 
                      placeholder="Search students by name, ID..." 
                      className="pl-9 h-10" 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant={skillFilter === null ? "default" : "outline"} size="sm" onClick={() => setSkillFilter(null)}>All</Button>
                    <Button variant={skillFilter === "basketball" ? "default" : "outline"} size="sm" onClick={() => setSkillFilter("basketball")}>Basketball</Button>
                    <Button variant={skillFilter === "programming" ? "default" : "outline"} size="sm" onClick={() => setSkillFilter("programming")}>Programming</Button>
                    <Button variant="outline" size="sm">Export CSV</Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {loading ? (
                  <div className="space-y-4 p-4">
                    <div className="flex items-center gap-3 rounded-lg border bg-muted/20 p-3">
                      <Image
                        src={CCS_LOGO}
                        alt="CCS logo"
                        width={32}
                        height={32}
                        className="animate-pulse rounded-md"
                        unoptimized
                      />
                      <span className="text-sm font-medium text-muted-foreground">Loading students...</span>
                    </div>

                    {viewMode === 'table' ? (
                      <div className="space-y-2">
                        <Skeleton className="h-10 w-full" />
                        {Array.from({ length: 6 }).map((_, i) => (
                          <Skeleton key={i} className="h-12 w-full" />
                        ))}
                      </div>
                    ) : viewMode === 'card' ? (
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
                        {Array.from({ length: 6 }).map((_, i) => (
                          <div key={i} className="space-y-3 rounded-lg border p-4">
                            <div className="flex items-center gap-3">
                              <Skeleton className="h-10 w-10 rounded-full" />
                              <div className="space-y-2">
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-3 w-32" />
                              </div>
                            </div>
                            <Skeleton className="h-3 w-full" />
                            <Skeleton className="h-3 w-2/3" />
                            <Skeleton className="h-8 w-full" />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {Array.from({ length: 7 }).map((_, i) => (
                          <Skeleton key={i} className="h-16 w-full" />
                        ))}
                      </div>
                    )}
                  </div>
                ) : error ? (
                  <div className="p-8 text-center text-destructive">
                    Failed to load students. Please try again later.
                  </div>
                ) : (
                  viewMode === 'table' ? (
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/30">
                          <TableHead className="w-[120px]">Student ID</TableHead>
                          <TableHead>Name & Email</TableHead>
                          <TableHead>Course</TableHead>
                          <TableHead>Year Level</TableHead>
                          <TableHead>Academic Year</TableHead>
                          <TableHead>Skills</TableHead>
                          <TableHead>Affiliations</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredStudents.map((student: any) => (
                          <TableRow key={student.id} className="cursor-default hover:bg-muted/20 transition-colors">
                            <TableCell className="font-mono text-xs font-semibold">{student.id}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <Avatar className="h-9 w-9 ring-1 ring-border">
                                  <AvatarImage src={student.imageUrl || CCS_LOGO} />
                                  <AvatarFallback>{student.name[0]}</AvatarFallback>
                                </Avatar>
                                <div className="flex flex-col">
                                  <span className="font-medium text-sm leading-none">{student.name}</span>
                                  <span className="text-[10px] text-muted-foreground mt-1">{student.email}</span>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="text-sm">{student.course}</TableCell>
                            <TableCell className="text-sm">{student.year}</TableCell>
                            <TableCell className="text-sm">{student.academicYear}</TableCell>
                            <TableCell className="text-sm">
                              {Array.isArray(student.skills) ? student.skills.map((skill: string, i: number) => (
                                <Badge key={i} className="mr-1 mb-1 inline-block" variant="secondary">{skill}</Badge>
                              )) : student.skills}
                            </TableCell>
                            <TableCell className="text-sm">
                              {Array.isArray(student.affiliations) ? student.affiliations.map((aff: string, i: number) => (
                                <Badge key={i} className="mr-1 mb-1 inline-block" variant="outline">{aff}</Badge>
                              )) : student.affiliations}
                            </TableCell>
                            <TableCell>
                              <Badge variant={student.status === "Active" ? "default" : student.status === "Graduated" ? "secondary" : "outline"} className={student.status === "Active" ? "bg-accent text-accent-foreground" : "text-[10px]"}>
                                {student.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem className="cursor-pointer" onClick={() => router.push(`/students/profile?id=${student.id}`)}>
                                    View Records
                                  </DropdownMenuItem>
                                  {isAdmin && (
                                    <>
                                      <DropdownMenuItem
                                        className="cursor-pointer"
                                        onClick={() => {
                                          setEditStudent(student)
                                          setFormStatus(student.status || "Active")
                                          setIsDialogOpen(true)
                                        }}
                                      >
                                        Edit Info
                                      </DropdownMenuItem>
                                      <DropdownMenuItem 
                                        className="text-destructive cursor-pointer"
                                        onClick={() => handleDeleteStudent(student.docId || student.id)}
                                      >
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Delete Record
                                      </DropdownMenuItem>
                                    </>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))}
                        {filteredStudents.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={9} className="h-32 text-center text-muted-foreground italic">
                              No matching students found in the database.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  ) : viewMode === 'card' ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 p-4">
                      {filteredStudents.map((student: any) => (
                        <Card key={student.id} className="border shadow-sm">
                          <CardHeader>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-9 w-9 ring-1 ring-border">
                                <AvatarImage src={student.imageUrl || CCS_LOGO} alt={student.name} />
                                <AvatarFallback>{student.name[0]}</AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-semibold text-lg">{student.name}</div>
                                <div className="text-xs text-muted-foreground">{student.email}</div>
                                <div className="text-xs">ID: {student.id}</div>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="text-xs mb-2">{student.course} | {student.year} | {student.academicYear}</div>
                            <div className="mb-2">
                              {Array.isArray(student.skills) && student.skills.map((skill: string, i: number) => (
                                <Badge key={i} className="mr-1 mb-1 inline-block" variant="secondary">{skill}</Badge>
                              ))}
                            </div>
                            <div className="mb-2">
                              {Array.isArray(student.affiliations) && student.affiliations.map((aff: string, i: number) => (
                                <Badge key={i} className="mr-1 mb-1 inline-block" variant="outline">{aff}</Badge>
                              ))}
                            </div>
                            <div className="flex justify-between items-center">
                              <Badge variant={student.status === "Active" ? "default" : student.status === "Graduated" ? "secondary" : "outline"}>{student.status}</Badge>
                              <Button size="sm" variant="outline" onClick={() => router.push(`/students/profile?id=${student.id}`)}>View</Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                      {filteredStudents.length === 0 && (
                        <div className="col-span-full text-center text-muted-foreground italic">No matching students found in the database.</div>
                      )}
                    </div>
                  ) : (
                    <ul className="divide-y">
                      {filteredStudents.map((student: any) => (
                        <li key={student.id} className="flex items-center gap-4 p-4 hover:bg-muted/10">
                          <Avatar className="h-10 w-10 ring-1 ring-border">
                            <AvatarImage src={student.imageUrl || CCS_LOGO} />
                            <AvatarFallback>{student.name[0]}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="font-medium">{student.name}</div>
                            <div className="text-xs text-muted-foreground">{student.email}</div>
                            <div className="text-xs">{student.course} | {student.year} | {student.academicYear}</div>
                            <div className="text-xs mt-1">
                              Skills: {Array.isArray(student.skills) ? student.skills.join(", ") : student.skills}
                            </div>
                          </div>
                          <Button size="sm" variant="outline" onClick={() => router.push(`/students/profile?id=${student.id}`)}>View</Button>
                        </li>
                      ))}
                      {filteredStudents.length === 0 && (
                        <li className="text-center text-muted-foreground italic p-4">No matching students found in the database.</li>
                      )}
                    </ul>
                  )
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </SidebarInset>
    </>
  )
}
