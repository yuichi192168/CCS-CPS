import { AppHeader } from "@/components/layout/app-header";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { SidebarInset } from "@/components/ui/sidebar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter, BookOpen, User, Calendar, ExternalLink, Download } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const papers = [
  { title: "Optimizing Distributed Systems with AI", authors: "Dr. Elena Smith, Alice Henderson", year: "2023", tags: ["AI", "Systems"], citation: 12 },
  { title: "Ethical Considerations in Large Language Models", authors: "Prof. Alan Turing", year: "2024", tags: ["Ethics", "LLM"], citation: 5 },
  { title: "New Approaches to Quantum Cryptography", authors: "Dr. Grace Hopper", year: "2022", tags: ["Quantum", "Security"], citation: 84 },
  { title: "Developing Sustainable Tech for Remote Areas", authors: "John Doe, David Tennant", year: "2023", tags: ["Green Tech", "Education"], citation: 2 },
];

export default function ResearchPage() {
  return (
    <>
      <AppSidebar />
      <SidebarInset>
        <AppHeader />
        <main className="flex-1 p-4 md:p-6 lg:p-8">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="font-headline text-3xl font-bold tracking-tight text-primary">Research Repository</h1>
                <p className="text-muted-foreground">Centralized database of college publications and journals.</p>
              </div>
              <Button className="gap-2">
                <BookOpen className="h-4 w-4" />
                Submit New Research
              </Button>
            </div>

            <div className="flex flex-col gap-4 md:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search by title, author, or keyword..." className="pl-9 h-11" />
              </div>
              <Button variant="outline" className="h-11 gap-2">
                <Filter className="h-4 w-4" />
                Advanced Filtering
              </Button>
            </div>

            <div className="grid gap-4">
              {papers.map((paper, i) => (
                <Card key={i} className="shadow-sm border-none ring-1 ring-border hover:ring-accent transition-all">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="font-headline text-xl font-semibold leading-tight text-primary hover:underline cursor-pointer">
                          {paper.title}
                        </CardTitle>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1.5"><User className="h-3.5 w-3.5" /> {paper.authors}</span>
                          <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" /> {paper.year}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon"><Download className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon"><ExternalLink className="h-4 w-4" /></Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {paper.tags.map(tag => (
                        <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                      ))}
                    </div>
                    <div className="pt-4 border-t flex items-center justify-between">
                       <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Cited by {paper.citation} papers</span>
                       <Button variant="link" size="sm" className="h-auto p-0 text-accent">Read Full Abstract →</Button>
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