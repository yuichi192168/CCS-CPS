"use client"

import { useState } from "react";
import { AppHeader } from "@/components/layout/app-header";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { SidebarInset } from "@/components/ui/sidebar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Wand2, Loader2, FileText, Copy, Save } from "lucide-react";
import { generateSyllabusOutline } from "@/ai/flows/generate-syllabus-outline-flow";
import { useToast } from "@/hooks/use-toast";

export default function SyllabusTool() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [objectives, setObjectives] = useState("");
  const [topics, setTopics] = useState("");
  const [result, setResult] = useState<string | null>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!objectives || !topics) {
      toast({ title: "Incomplete Input", description: "Please provide both objectives and topics.", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const response = await generateSyllabusOutline({
        courseObjectives: objectives,
        courseTopics: topics
      });
      setResult(response.syllabusOutline);
      toast({ title: "Success!", description: "Syllabus outline generated." });
    } catch (error) {
      toast({ title: "Generation Failed", description: "An error occurred during AI processing.", variant: "destructive" });
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
          <div className="mx-auto max-w-4xl space-y-6">
            <div>
              <h1 className="font-headline text-3xl font-bold tracking-tight text-primary">Syllabus Generator</h1>
              <p className="text-muted-foreground">Leverage AI to create structured lesson plans and syllabus outlines.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <Card className="shadow-sm border-none ring-1 ring-border h-fit">
                <CardHeader>
                  <CardTitle className="text-lg">Input Parameters</CardTitle>
                  <CardDescription>Provide details about your course.</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleGenerate} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="objectives">Course Objectives</Label>
                      <Textarea 
                        id="objectives" 
                        placeholder="e.g., Students will understand the fundamentals of data structures and algorithms..." 
                        className="min-h-[120px]"
                        value={objectives}
                        onChange={(e) => setObjectives(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="topics">Key Topics (Comma-separated)</Label>
                      <Input 
                        id="topics" 
                        placeholder="e.g., Arrays, Linked Lists, Trees, Graphs, Big O" 
                        value={topics}
                        onChange={(e) => setTopics(e.target.value)}
                      />
                    </div>
                    <Button type="submit" className="w-full gap-2" disabled={loading}>
                      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
                      Generate Outline
                    </Button>
                  </form>
                </CardContent>
              </Card>

              <Card className="shadow-sm border-none ring-1 ring-border min-h-[400px] flex flex-col">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">Generated Content</CardTitle>
                    <CardDescription>AI-generated syllabus structure.</CardDescription>
                  </div>
                  {result && (
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" onClick={() => {
                        navigator.clipboard.writeText(result);
                        toast({ title: "Copied", description: "Copied to clipboard" });
                      }}><Copy className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon"><Save className="h-4 w-4" /></Button>
                    </div>
                  )}
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  {result ? (
                    <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap rounded-md bg-muted/30 p-4 font-body text-sm leading-relaxed border flex-1 overflow-auto">
                      {result}
                    </div>
                  ) : (
                    <div className="flex flex-1 flex-col items-center justify-center text-center p-8 border border-dashed rounded-md bg-muted/10">
                      <FileText className="h-10 w-10 text-muted-foreground/30 mb-2" />
                      <p className="text-sm text-muted-foreground">Fill in the parameters and click generate to see the magic happen.</p>
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