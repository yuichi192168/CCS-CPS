import { AppHeader } from "@/components/layout/app-header";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { SidebarInset } from "@/components/ui/sidebar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mail, Globe, MapPin, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

const faculty = [
  { 
    name: "Dr. Elena Smith", 
    role: "Department Head", 
    specialization: "Artificial Intelligence", 
    publications: 42, 
    email: "e.smith@university.edu",
    image: "https://picsum.photos/seed/faculty1/200"
  },
  { 
    name: "Prof. Alan Turing", 
    role: "Senior Lecturer", 
    specialization: "Theoretical Computer Science", 
    publications: 128, 
    email: "a.turing@university.edu",
    image: "https://picsum.photos/seed/faculty2/200"
  },
  { 
    name: "Dr. Grace Hopper", 
    role: "Assistant Professor", 
    specialization: "Software Engineering", 
    publications: 35, 
    email: "g.hopper@university.edu",
    image: "https://picsum.photos/seed/faculty3/200"
  },
  { 
    name: "Prof. Linus Torvalds", 
    role: "Adjunct Professor", 
    specialization: "Operating Systems", 
    publications: 15, 
    email: "l.torvalds@university.edu",
    image: "https://picsum.photos/seed/faculty4/200"
  }
];

export default function FacultyPage() {
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

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {faculty.map((member) => (
                <Card key={member.name} className="overflow-hidden shadow-sm border-none ring-1 ring-border group hover:ring-accent transition-all duration-300">
                  <div className="h-32 bg-primary group-hover:bg-primary/90 transition-colors" />
                  <CardContent className="relative flex flex-col items-center p-6 pt-0">
                    <Avatar className="h-20 w-20 -mt-10 border-4 border-background ring-2 ring-primary/5">
                      <AvatarImage src={member.image} />
                      <AvatarFallback>{member.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="mt-4 text-center">
                      <h3 className="font-headline font-bold text-lg">{member.name}</h3>
                      <p className="text-sm text-accent font-medium">{member.role}</p>
                      <p className="text-xs text-muted-foreground mt-1">Specialization: {member.specialization}</p>
                    </div>
                    <div className="mt-4 flex flex-wrap justify-center gap-2">
                      <Badge variant="secondary" className="text-[10px]">{member.publications} Publications</Badge>
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
            </div>
          </div>
        </main>
      </SidebarInset>
    </>
  );
}