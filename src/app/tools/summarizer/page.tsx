"use client"

import { useState } from "react";
import { AppHeader } from "@/components/layout/app-header";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { SidebarInset } from "@/components/ui/sidebar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { BookOpen, Loader2, Copy, Trash2, FileSearch } from "lucide-react";
import { summarizeResearchPaper } from "@/ai/flows/summarize-research-paper-flow";
import { useToast } from "@/hooks/use-toast";

export default function SummarizerTool() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState("");
  const [summary, setSummary] = useState<string | null>(null);

  const handleSummarize = async () => {
    if (!content || content.length < 100) {
      toast({ title: "Content too short", description: "Please provide more research text to summarize.", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const response = await summarizeResearchPaper({ paperContent: content });
      setSummary(response.summary);
      toast({ title: "Summarized!", description: "Research insights extracted successfully." });
    } catch (error) {
      toast({ title: "Error", description: "Could not summarize at this time.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <AppSidebar />
      <SidebarInset>
        <AppHeader />
        <main className="flex-1 p-4 md:p-6 lg:p-8">
          <div className="mx-auto max-w-5xl space-y-6">
            <div className="text-center md:text-left">
              <h1 className="font-headline text-3xl font-bold tracking-tight text-primary">Research Summarizer</h1>
              <p className="text-muted-foreground">Quickly extract the core arguments and findings from complex research papers.</p>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <Card className="shadow-sm border-none ring-1 ring-border h-full">
                <CardHeader>
                  <CardTitle className="text-lg">Research Content</CardTitle>
                  <CardDescription>Paste the text of the research paper below.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="research-text">Full Text</Label>
                    <Textarea 
                      id="research-text" 
                      placeholder="Paste research paper text here (at least 100 characters)..." 
                      className="min-h-[400px] font-body text-sm resize-none"
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1" onClick={() => setContent("")} disabled={loading}>
                      <Trash2 className="mr-2 h-4 w-4" /> Clear
                    </Button>
                    <Button className="flex-[2] gap-2" onClick={handleSummarize} disabled={loading}>
                      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileSearch className="h-4 w-4" />}
                      Generate Summary
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-sm border-none ring-1 ring-border h-full flex flex-col">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">Key Insights</CardTitle>
                    <CardDescription>Distilled summary of the content.</CardDescription>
                  </div>
                  {summary && (
                    <Button variant="ghost" size="icon" onClick={() => {
                      navigator.clipboard.writeText(summary);
                      toast({ title: "Copied", description: "Summary copied to clipboard." });
                    }}><Copy className="h-4 w-4" /></Button>
                  )}
                </CardHeader>
                <CardContent className="flex-1">
                  {summary ? (
                    <div className="bg-accent/5 rounded-lg p-6 border-l-4 border-accent h-full">
                      <h4 className="font-bold text-primary mb-4 flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-accent" />
                        Executive Summary
                      </h4>
                      <p className="text-sm leading-relaxed text-foreground whitespace-pre-wrap">{summary}</p>
                    </div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center p-12 opacity-40">
                      <BookOpen className="h-16 w-16 mb-4" />
                      <p className="max-w-xs italic">Summary will appear here once the text is processed by the AI system.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </SidebarInset>
    </>
  );
}
