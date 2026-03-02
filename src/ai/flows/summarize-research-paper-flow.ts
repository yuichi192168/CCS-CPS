'use server';
/**
 * @fileOverview An AI agent that summarizes research paper content.
 *
 * - summarizeResearchPaper - A function that handles the research paper summarization process.
 * - SummarizeResearchPaperInput - The input type for the summarizeResearchPaper function.
 * - SummarizeResearchPaperOutput - The return type for the summarizeResearchPaper function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const SummarizeResearchPaperInputSchema = z.object({
  paperContent: z.string().describe('The full text content of the research paper to be summarized.'),
});
export type SummarizeResearchPaperInput = z.infer<typeof SummarizeResearchPaperInputSchema>;

const SummarizeResearchPaperOutputSchema = z.object({
  summary: z.string().describe('A concise summary of the research paper.'),
});
export type SummarizeResearchPaperOutput = z.infer<typeof SummarizeResearchPaperOutputSchema>;

export async function summarizeResearchPaper(input: SummarizeResearchPaperInput): Promise<SummarizeResearchPaperOutput> {
  return summarizeResearchPaperFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeResearchPaperPrompt',
  input: { schema: SummarizeResearchPaperInputSchema },
  output: { schema: SummarizeResearchPaperOutputSchema },
  prompt: `You are an expert academic summarizer. Your task is to provide a concise and accurate summary of the provided research paper content.
Focus on the core arguments, methodology, key findings, and conclusions.
The summary should be easy to understand for someone who needs to quickly grasp the essence of the paper.

Research Paper Content:

{{{paperContent}}}`,
});

const summarizeResearchPaperFlow = ai.defineFlow(
  {
    name: 'summarizeResearchPaperFlow',
    inputSchema: SummarizeResearchPaperInputSchema,
    outputSchema: SummarizeResearchPaperOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
