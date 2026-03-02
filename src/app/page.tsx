
"use client"

import { useMemo } from "react"
import { AppHeader } from "@/components/layout/app-header"
import { AppSidebar } from "@/components/layout/app-sidebar"
import { SidebarInset } from "@/components/ui/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { GraduationCap, Users, Library, Calendar, TrendingUp, BookOpen, UserCircle, History, Award, CheckCircle2, AlertCircle } from "lucide-react"
import { useCollection, useFirestore } from "@/firebase"
import { useUserProfile } from "@/firebase/auth/use-user-profile"
import { collection } from "firebase/firestore"
import { Skeleton } from "@/components/ui/skeleton"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function Dashboard() {
  const db = useFirestore()
  const { profile, loading: profileLoading } = useUserProfile()

  const studentsRef = useMemo(() => collection(db, "students"), [db])
  const facultyRef = useMemo(() => collection(db, "faculty"), [db])
  const researchRef = useMemo(() => collection(db, "research"), [db])
  const eventsRef = useMemo(() => collection(db, "events"), [db])

  const { data: students, loading: loadingStudents } = useCollection(studentsRef)
  const { data: faculty, loading: loadingFaculty } = useCollection(facultyRef)
  const { data: research, loading: loadingResearch } = useCollection(researchRef)
  const { data: events, loading: loadingEvents } = useCollection(eventsRef)

  const stats = [
    { label: "Total Students", value: loadingStudents ? "..." : (students?.length || 0).toString(), icon: GraduationCap, bg: "bg-blue-50", iconColor: "text-blue-600" },
    { label: "Faculty Members", value: loadingFaculty ? "..." : (faculty?.length || 0).toString(), icon: Users, bg: "bg-emerald-50", iconColor: "text-emerald-600" },
    { label: "Research Papers", value: loadingResearch ? "..." : (research?.length || 0).toString(), icon: Library, bg: "bg-indigo-50", iconColor: "text-indigo-600" },
    { label: "Upcoming Events", value: loadingEvents ? "..." : (events?.length || 0).toString(), icon: Calendar, bg: "bg-orange-50", iconColor: "text-orange-600" },
  ]

  const studentActions = [
    { title: "My Academic Profile", desc: "View and update your student records", icon: UserCircle, url: "/profile" },
    { title: "Research Repository", desc: "Explore published works", icon: Library, url: "/research" },
    { title: "Campus Events", desc: "Stay updated with college activities", icon: Calendar, url: "/events" },
  ]

  const facultyActions = [
    { title: "Faculty Portal", desc: "Manage your professional profile", icon: UserCircle, url: "/profile" },
    { title: "Syllabus Tools", desc: "Generate instructional outlines", icon: BookOpen, url: "/tools/syllabus" },
    { title: "Submit Research", desc: "Add new publications to the repository", icon: Library, url: "/research" },
  ]

  const adminActions = [
    { title: "Student Management", desc: "Enroll and manage student records", icon: GraduationCap, url: "/students" },
    { title: "Faculty Directory", desc: "Manage faculty profiles and rankings", icon: Users, url: "/faculty" },
    { title: "Event Scheduler", desc: "Organize academic calendar events", icon: Calendar, url: "/events" },
  ]

  if (profileLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <Skeleton className="h-4 w-[200px]" />
        </div>
      </div>
    )
  }

  return (
    <>
      <AppSidebar />
      <SidebarInset>
        <AppHeader />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-2">
              <h1 className="font-headline text-3xl font-bold tracking-tight text-primary">
                {profile?.role === 'admin' ? "System Administration" : 
                 profile?.role === 'faculty' ? "Faculty Portal" : 
                 profile?.role === 'student' ? "Student Dashboard" : "College Portal"}
              </h1>
              <div className="flex items-center gap-2 text-muted-foreground">
                <span className="text-sm">Welcome, <strong>{profile?.displayName || "Guest"}</strong>.</span>
                {profile && (
                  <div className="flex items-center gap-1 text-xs font-medium px-2 py-0.5 bg-primary/10 text-primary rounded-full">
                    <CheckCircle2 className="h-3 w-3" />
                    <span className="capitalize">{profile.role} Access</span>
                  </div>
                )}
              </div>
            </div>

            {/* General Stats */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {stats.map((stat) => (
                <Card key={stat.label} className="border-none shadow-sm ring-1 ring-border">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{stat.label}</CardTitle>
                    <div className={`rounded-lg p-2 ${stat.bg}`}>
                      <stat.icon className={`h-4 w-4 ${stat.iconColor}`} />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                      <TrendingUp className="h-3 w-3 text-emerald-500" />
                      <span className="text-emerald-500 font-medium">Updated live</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              {/* Quick Actions Area */}
              <Card className="lg:col-span-2 border-none shadow-sm ring-1 ring-border">
                <CardHeader>
                  <CardTitle className="text-lg">Quick Access & Tools</CardTitle>
                  <CardDescription>Primary functions based on your {profile?.role || "guest"} permissions.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {(profile?.role === 'student' ? studentActions : 
                      profile?.role === 'faculty' ? facultyActions : 
                      profile?.role === 'admin' ? adminActions : studentActions).map((action, i) => (
                      <Link key={i} href={action.url}>
                        <div className="group flex items-start gap-4 p-4 rounded-xl border bg-muted/5 hover:bg-primary/5 hover:border-primary/20 transition-all duration-200">
                          <div className="p-3 rounded-lg bg-background border shadow-sm group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                            <action.icon className="h-5 w-5" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-sm group-hover:text-primary transition-colors">{action.title}</h4>
                            <p className="text-xs text-muted-foreground line-clamp-1">{action.desc}</p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Announcements / Notifications */}
              <Card className="border-none shadow-sm ring-1 ring-border">
                <CardHeader>
                  <CardTitle className="text-lg">Notifications</CardTitle>
                  <CardDescription>Latest system updates and alerts.</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y border-t">
                    {[
                      { title: "System Maintenance", time: "2h ago", type: "info" },
                      { title: "Research Deadline", time: "5h ago", type: "warning" },
                      { title: "New Academic Calendar", time: "1d ago", type: "success" },
                    ].map((notif, i) => (
                      <div key={i} className="flex items-center gap-4 p-4 hover:bg-muted/30 transition-colors">
                        <div className="h-2 w-2 rounded-full bg-primary" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">{notif.title}</p>
                          <p className="text-xs text-muted-foreground">{notif.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Profile Status Alert for new users */}
            {!profileLoading && profile && (
              <Card className="border-none shadow-sm ring-1 ring-border bg-amber-50/50">
                <CardContent className="p-4 flex flex-col sm:flex-row items-center gap-4">
                  <div className="p-2 rounded-full bg-amber-100 text-amber-600">
                    <AlertCircle className="h-5 w-5" />
                  </div>
                  <div className="flex-1 text-center sm:text-left">
                    <h4 className="text-sm font-semibold text-amber-900">Complete Your Academic Profile</h4>
                    <p className="text-xs text-amber-700">Ensure your student/faculty records are up to date for accurate profiling.</p>
                  </div>
                  <Button size="sm" variant="outline" className="bg-background" asChild>
                    <Link href="/profile">Update Now</Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </main>
      </SidebarInset>
    </>
  )
}
