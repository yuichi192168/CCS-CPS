import { AppHeader } from "@/components/layout/app-header";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { SidebarInset } from "@/components/ui/sidebar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Calendar as CalendarUI } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, MapPin, Plus, Calendar as CalendarIcon, Filter } from "lucide-react";

const events = [
  { title: "CCS Hackathon 2024", date: "Oct 12-14, 2024", time: "09:00 AM", location: "Main Hall", type: "Competition" },
  { title: "Midterm Examinations", date: "Oct 20-25, 2024", time: "All Day", location: "Online / Campus", type: "Academic" },
  { title: "Faculty General Assembly", date: "Nov 02, 2024", time: "02:00 PM", location: "Room 302", type: "Administrative" },
  { title: "Cybersecurity Workshop", date: "Nov 15, 2024", time: "10:00 AM", location: "CS Lab 1", type: "Workshop" },
];

export default function EventsPage() {
  return (
    <>
      <AppSidebar />
      <SidebarInset>
        <AppHeader />
        <main className="flex-1 p-4 md:p-6 lg:p-8">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="font-headline text-3xl font-bold tracking-tight text-primary">Academic Calendar</h1>
                <p className="text-muted-foreground">View and manage college events and schedules.</p>
              </div>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Add Event
              </Button>
            </div>

            <div className="grid gap-6 lg:grid-cols-12">
              <Card className="lg:col-span-4 shadow-sm border-none ring-1 ring-border">
                <CardHeader>
                  <CardTitle className="text-lg">Event Calendar</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-center border rounded-md p-2 bg-muted/10">
                    <CalendarUI mode="single" className="w-full" />
                  </div>
                </CardContent>
              </Card>

              <Card className="lg:col-span-8 shadow-sm border-none ring-1 ring-border">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">Upcoming Events</CardTitle>
                    <CardDescription>Scheduled activities for the next 30 days.</CardDescription>
                  </div>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Filter className="h-3 w-3" />
                    Filter
                  </Button>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y border-t">
                    {events.map((event, i) => (
                      <div key={i} className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 hover:bg-muted/30 transition-colors">
                        <div className="flex h-12 w-12 flex-col items-center justify-center rounded-lg bg-primary/10 text-primary">
                           <span className="text-[10px] font-bold uppercase leading-none opacity-60">OCT</span>
                           <span className="text-xl font-bold leading-none">{12 + i * 2}</span>
                        </div>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold text-primary">{event.title}</h4>
                            <Badge variant="outline" className="text-[10px] py-0">{event.type}</Badge>
                          </div>
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" /> {event.time}</span>
                            <span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" /> {event.location}</span>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">Details</Button>
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