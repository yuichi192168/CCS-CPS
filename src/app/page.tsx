
"use client"

import { useMemo } from "react"
import { AppHeader } from "@/components/layout/app-header"
import { AppSidebar } from "@/components/layout/app-sidebar"
import { SidebarInset } from "@/components/ui/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { GraduationCap, Users, Library, Calendar, TrendingUp, BookOpen, UserCircle, History, Award } from "lucide-react"
import { useCollection, useFirestore } from "@/firebase"
import { useUserProfile } from "@/firebase/auth/use-user-profile"
import { collection } from "firebase/firestore"
import { Skeleton } from "@/components/ui/skeleton"

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

  const studentFeatures = [
    { title: "My Profile", desc: "Update your academic information", icon: UserCircle },
    { title: "Memberships", desc: "View organization involvements", icon: Award },
    { title: "Participation", desc: "History of attended events", icon: History },
  ]

  const facultyFeatures = [
    { title: "Research Portals", desc: "Manage your published works", icon: Library },
    { title: "Syllabus Management", desc: "Access instructional tools", icon: BookOpen },
    { title: "Personal Schedule", desc: "View upcoming academic tasks", icon: Calendar },
  ]

  if (profileLoading) {
    return (
      <>
        <AppSidebar />
        <SidebarInset>
          <AppHeader />
          <div className="flex-1 space-y-4 p-8 pt-6">
            <Skeleton className="h-10 w-[250px]" />
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Skeleton className="h-24" />
              <Skeleton className="h-24" />
              <Skeleton className="h-24" />
              <Skeleton className="h-24" />
            </div>
          </div>
        </SidebarInset>
      </>
    )
  }

  return (
    <>
      <AppSidebar />
      <SidebarInset>
        <AppHeader />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <div className="flex flex-col gap-6">
            <div>
              <h1 className="font-headline text-3xl font-bold tracking-tight text-primary">
                {profile?.role === 'admin' ? "System Administration" : 
                 profile?.role === 'faculty' ? "Faculty Portal" : 
                 profile?.role === 'student' ? "Student Dashboard" : "College Portal"}
              </h1>
              <p className="text-muted-foreground">
                Welcome, {profile?.displayName || "Guest"}. {profile?.role ? `You have ${profile.role} access level.` : "Sign in to access personalized features."}
              </p>
            </div>

            {/* General Stats - Visible to all but tailored for Admin */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {stats.map((stat) => (
                <Card key={stat.label} className="overflow-hidden border-none shadow-sm ring-1 ring-border">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">{stat.label}</CardTitle>
                    <div className={`rounded-md p-2 ${stat.bg}`}>
                      <stat.icon className={`h-4 w-4 ${stat.iconColor}`} />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                      <TrendingUp className="h-3 w-3 text-accent" />
                      <span className="text-accent">+2%</span> this semester
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
              {/* Main Content Area */}
              <Card className="lg:col-span-4 shadow-sm border-none ring-1 ring-border">
                <CardHeader>
                  <CardTitle className="font-headline text-lg">
                    {profile?.role === 'student' ? "Student Involvement" : 
                     profile?.role === 'faculty' ? "Faculty Research & Syllabi" : 
                     "Academic Overview"}
                  </CardTitle>
                  <CardDescription>
                    {profile?.role === 'student' ? "Track your growth and participation." : 
                     profile?.role === 'faculty' ? "Manage your professional academic output." : 
                     "College-wide analytics and trends."}
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-[300px] border-t p-6">
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {(profile?.role === 'student' ? studentFeatures : 
                        profile?.role === 'faculty' ? facultyFeatures : 
                        []).map((feature, i) => (
                        <div key={i} className="flex items-center gap-4 p-4 rounded-xl border bg-muted/5 hover:bg-muted/10 transition-colors cursor-pointer">
                          <div className="p-3 rounded-lg bg-primary/10 text-primary">
                            <feature.icon className="h-5 w-5" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-sm">{feature.title}</h4>
                            <p className="text-xs text-muted-foreground">{feature.desc}</p>
                          </div>
                        </div>
                      ))}
                      {(!profile?.role || profile?.role === 'admin') && (
                        <div className="col-span-full flex h-full items-center justify-center italic text-muted-foreground text-sm">
                          Admin Analytics Visualization (Coming Soon)
                        </div>
                      )}
                   </div>
                </CardContent>
              </Card>

              {/* Sidebar Content Area */}
              <Card className="lg:col-span-3 shadow-sm border-none ring-1 ring-border">
                <CardHeader>
                  <CardTitle className="font-headline text-lg">System Notifications</CardTitle>
                  <CardDescription>Latest updates for your profile.</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y border-t">
                    {[
                      { user: "System", action: profile?.role === 'faculty' ? "Research deadline extended" : "New event scheduled", time: "2 hours ago", icon: Calendar },
                      { user: "Admin", action: "Policy update for next semester", time: "5 hours ago", icon: Users },
                      { user: "Library", action: "New journals added to repository", time: "1 day ago", icon: Library },
                    ].map((item, i) => (
                      <div key={i} className="flex items-start gap-4 p-4 transition-colors hover:bg-muted/30">
                        <div className="mt-0.5 rounded-full border bg-background p-1.5 shadow-sm">
                          <item.icon className="h-3.5 w-3.5 text-primary" />
                        </div>
                        <div className="flex-1 space-y-1">
                          <p className="text-sm leading-none">
                            <span className="font-medium text-foreground">{item.user}</span>: {item.action}
                          </p>
                          <p className="text-xs text-muted-foreground">{item.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </SidebarInset>
    </>
  )
}
