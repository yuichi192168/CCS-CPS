"use client"

import { useMemo, useState } from "react"
import { AppHeader } from "@/components/layout/app-header"
import { AppSidebar } from "@/components/layout/app-sidebar"
import { SidebarInset } from "@/components/ui/sidebar"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Calendar as CalendarUI } from "@/components/ui/calendar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Clock, MapPin, Plus, Filter, Loader2 } from "lucide-react"
import { useCollection, useFirestore, useUser } from "@/firebase"
import { collection, query, orderBy, addDoc } from "firebase/firestore"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { errorEmitter } from "@/firebase/error-emitter"
import { FirestorePermissionError } from "@/firebase/errors"

export default function EventsPage() {
  const db = useFirestore()
  const { user } = useUser()
  const { toast } = useToast()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [eventType, setEventType] = useState("Academic")
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [selectedEvent, setSelectedEvent] = useState<any | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)

  const eventsQuery = useMemo(() => {
    if (!db) return null
    return query(collection(db, "events"), orderBy("date", "asc"))
  }, [db])

  const { data: events, loading, error } = useCollection(eventsQuery)

  const availableTypes = useMemo(() => {
    const types = (events || []).map((e: any) => e.type).filter(Boolean)
    return Array.from(new Set(types))
  }, [events])

  const filteredEvents = useMemo(() => {
    if (!events) return []

    const queryText = searchTerm.toLowerCase().trim()

    return events.filter((event: any) => {
      const title = (event.title || "").toLowerCase()
      const location = (event.location || "").toLowerCase()
      const type = (event.type || "").toLowerCase()
      const time = (event.time || "").toLowerCase()

      const matchesSearch = !queryText || title.includes(queryText) || location.includes(queryText) || type.includes(queryText) || time.includes(queryText)
      const matchesType = typeFilter === "all" || event.type === typeFilter

      const eventDateString = String(event.date || "")
      const selectedDateString = selectedDate ? `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, "0")}-${String(selectedDate.getDate()).padStart(2, "0")}` : ""
      const matchesDate = !selectedDate || eventDateString === selectedDateString

      return matchesSearch && matchesType && matchesDate
    })
  }, [events, searchTerm, typeFilter, selectedDate])

  const handleAddEvent = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!eventType) {
      toast({ title: "Event type required", description: "Please select an event type.", variant: "destructive" })
      return
    }

    const formData = new FormData(e.currentTarget)
    const newEvent = {
      title: formData.get("title") as string,
      date: formData.get("date") as string,
      time: formData.get("time") as string,
      location: formData.get("location") as string,
      type: eventType,
    }

    const eventsRef = collection(db, "events")
    addDoc(eventsRef, newEvent)
      .then(() => {
        setIsDialogOpen(false)
        setEventType("Academic")
        toast({ title: "Success", description: "Event scheduled successfully." })
      })
      .catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
          path: eventsRef.path,
          operation: "create",
          requestResourceData: newEvent,
        })
        errorEmitter.emit("permission-error", permissionError)
      })
  }

  const openDetails = (event: any) => {
    setSelectedEvent(event)
    setIsDetailsOpen(true)
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
                <h1 className="font-headline text-3xl font-bold tracking-tight text-primary">Academic Calendar</h1>
                <p className="text-muted-foreground">View and manage college events and schedules.</p>
              </div>

              <Dialog
                open={isDialogOpen}
                onOpenChange={(open) => {
                  setIsDialogOpen(open)
                  if (!open) setEventType("Academic")
                }}
              >
                <DialogTrigger asChild>
                  <Button className="gap-2" disabled={!user}>
                    <Plus className="h-4 w-4" />
                    Add Event
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-xl">
                  <form onSubmit={handleAddEvent}>
                    <DialogHeader>
                      <DialogTitle>Add Academic Event</DialogTitle>
                    </DialogHeader>
                    <div className="grid max-h-[65vh] gap-4 overflow-y-auto py-4 pr-1">
                      <div className="grid gap-2">
                        <Label htmlFor="title">Event Title</Label>
                        <Input id="title" name="title" placeholder="Midterm Exams, Hackathon, etc." required />
                      </div>
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="grid gap-2">
                          <Label htmlFor="date">Date</Label>
                          <Input id="date" name="date" type="date" required />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="time">Time</Label>
                          <Input id="time" name="time" placeholder="09:00 AM" required />
                        </div>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="location">Location</Label>
                        <Input id="location" name="location" placeholder="Main Hall, Online, etc." required />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="type">Event Type</Label>
                        <Select value={eventType} onValueChange={setEventType}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Competition">Competition</SelectItem>
                            <SelectItem value="Academic">Academic</SelectItem>
                            <SelectItem value="Administrative">Administrative</SelectItem>
                            <SelectItem value="Workshop">Workshop</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="submit">Schedule Event</Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid gap-6 lg:grid-cols-12">
              <Card className="lg:col-span-4 shadow-sm border-none ring-1 ring-border">
                <CardHeader>
                  <CardTitle className="text-lg">Event Calendar</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="w-full overflow-x-auto rounded-md border bg-muted/10 p-2">
                    <CalendarUI
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      className="mx-auto w-full max-w-[22rem]"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="lg:col-span-8 shadow-sm border-none ring-1 ring-border">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">Upcoming Events</CardTitle>
                    <CardDescription>Scheduled activities for the next 30 days.</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                      <SelectTrigger className="h-8 min-w-[140px]">
                        <SelectValue placeholder="Filter by type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        {availableTypes.map((type) => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2"
                      onClick={() => {
                        setSearchTerm("")
                        setTypeFilter("all")
                        setSelectedDate(undefined)
                      }}
                    >
                      <Filter className="h-3 w-3" />
                      Clear
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="border-t p-4">
                    <Input
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search events by title, location, type, or time..."
                    />
                  </div>
                  <div className="divide-y border-t">
                    {loading ? (
                      <div className="flex h-32 items-center justify-center">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                      </div>
                    ) : error ? (
                      <div className="p-8 text-center text-destructive">Failed to load events.</div>
                    ) : (
                      filteredEvents.map((event: any) => {
                        const eventDate = new Date(event.date)
                        const isValidDate = !Number.isNaN(eventDate.getTime())
                        const month = isValidDate ? eventDate.toLocaleString("default", { month: "short" }).toUpperCase() : "TBD"
                        const day = isValidDate ? eventDate.getDate() : "-"
                        
                        return (
                          <div key={event.id} className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 hover:bg-muted/30 transition-colors">
                            <div className="flex h-12 w-12 flex-col items-center justify-center rounded-lg bg-primary/10 text-primary">
                               <span className="text-[10px] font-bold uppercase leading-none opacity-60">{month}</span>
                               <span className="text-xl font-bold leading-none">{day}</span>
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
                            <Button variant="outline" size="sm" onClick={() => openDetails(event)}>Details</Button>
                          </div>
                        )
                      })
                    )}
                    {(!loading && filteredEvents.length === 0) && (
                      <div className="p-8 text-center text-muted-foreground italic">No events scheduled for the selected filters.</div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
              <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle>{selectedEvent?.title || "Event Details"}</DialogTitle>
                </DialogHeader>
                <div className="space-y-3 text-sm">
                  <p><span className="font-semibold">Date:</span> {selectedEvent?.date || "N/A"}</p>
                  <p><span className="font-semibold">Time:</span> {selectedEvent?.time || "N/A"}</p>
                  <p><span className="font-semibold">Location:</span> {selectedEvent?.location || "N/A"}</p>
                  <p><span className="font-semibold">Type:</span> {selectedEvent?.type || "N/A"}</p>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsDetailsOpen(false)}>Close</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </main>
      </SidebarInset>
    </>
  )
}
