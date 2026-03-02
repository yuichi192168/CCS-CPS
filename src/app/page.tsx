import { AppHeader } from "@/components/layout/app-header";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { SidebarInset } from "@/components/ui/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap, Users, Library, Calendar, TrendingUp, BookOpen } from "lucide-react";

const stats = [
  { label: "Total Students", value: "1,248", icon: GraduationCap, color: "text-blue-600", bg: "bg-blue-50" },
  { label: "Faculty Members", value: "84", icon: Users, iconColor: "text-emerald-600", bg: "bg-emerald-50" },
  { label: "Research Papers", value: "312", icon: Library, iconColor: "text-indigo-600", bg: "bg-indigo-50" },
  { label: "Upcoming Events", value: "12", icon: Calendar, iconColor: "text-orange-600", bg: "bg-orange-50" },
];

export default function Dashboard() {
  return (
    <>
      <AppSidebar />
      <SidebarInset>
        <AppHeader />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <div className="flex flex-col gap-6">
            <div>
              <h1 className="font-headline text-3xl font-bold tracking-tight text-primary">System Dashboard</h1>
              <p className="text-muted-foreground">Welcome to the CCS Comprehensive Profiling System. Here is what's happening in the College today.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {stats.map((stat) => (
                <Card key={stat.label} className="overflow-hidden border-none shadow-sm ring-1 ring-border">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">{stat.label}</CardTitle>
                    <div className={`rounded-md p-2 ${stat.bg}`}>
                      <stat.icon className={`h-4 w-4 ${stat.iconColor || stat.color}`} />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                      <TrendingUp className="h-3 w-3 text-accent" />
                      <span className="text-accent">+4%</span> from last semester
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
              <Card className="lg:col-span-4 shadow-sm border-none ring-1 ring-border">
                <CardHeader>
                  <CardTitle className="font-headline text-lg">Academic Overview</CardTitle>
                  <CardDescription>Research publications and student enrollment trends.</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px] flex items-center justify-center border-t">
                   <div className="text-muted-foreground text-sm italic">Analytics visualization goes here</div>
                </CardContent>
              </Card>

              <Card className="lg:col-span-3 shadow-sm border-none ring-1 ring-border">
                <CardHeader>
                  <CardTitle className="font-headline text-lg">Recent Activities</CardTitle>
                  <CardDescription>Latest updates across all modules.</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y border-t">
                    {[
                      { user: "Dr. Elena Smith", action: "uploaded a new research paper", time: "2 hours ago", icon: Library },
                      { user: "John Doe", action: "updated his student profile", time: "4 hours ago", icon: GraduationCap },
                      { user: "System", action: "scheduled 'Hackathon 2024'", time: "6 hours ago", icon: Calendar },
                      { user: "Prof. Alan Turing", action: "generated a new syllabus outline", time: "1 day ago", icon: BookOpen },
                    ].map((item, i) => (
                      <div key={i} className="flex items-start gap-4 p-4 transition-colors hover:bg-muted/30">
                        <div className="mt-0.5 rounded-full border bg-background p-1.5 shadow-sm">
                          <item.icon className="h-3.5 w-3.5 text-primary" />
                        </div>
                        <div className="flex-1 space-y-1">
                          <p className="text-sm leading-none">
                            <span className="font-medium text-foreground">{item.user}</span> {item.action}
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
  );
}
