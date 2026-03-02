'use server';
/**
 * @fileOverview An AI agent that generates structured outlines or descriptive text for syllabi and lesson plans.
 *
 * - generateSyllabusOutline - A function that handles the syllabus outline generation process.
 * - GenerateSyllabusOutlineInput - The input type for the generateSyllabusOutline function.
 * - GenerateSyllabusOutlineOutput - The return type for the generateSyllabusOutline function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateSyllabusOutlineInputSchema = z.object({
  courseObjectives: z
    .string()
    .describe('A detailed description of the course objectives.'),
  courseTopics: z
    .string()
    .describe('A comma-separated list of topics to be covered in the course.'),
});
export type GenerateSyllabusOutlineInput = z.infer<
  typeof GenerateSyllabusOutlineInputSchema
>;

const GenerateSyllabusOutlineOutputSchema = z.object({
  syllabusOutline: z
    .string()
    .describe(
      'The generated structured outline or descriptive text for the syllabus or lesson plan.'
    ),
});
export type GenerateSyllabusOutlineOutput = z.infer<
  typeof GenerateSyllabusOutlineOutputSchema
>;

export async function generateSyllabusOutline(
  input: GenerateSyllabusOutlineInput
): Promise<GenerateSyllabusOutlineOutput> {
  return generateSyllabusOutlineFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateSyllabusOutlinePrompt',
  input: {schema: GenerateSyllabusOutlineInputSchema},
  output: {schema: GenerateSyllabusOutlineOutputSchema},
  prompt: `You are an AI assistant specialized in creating structured educational content.

Based on the following course objectives and topics, generate a comprehensive and well-structured outline or descriptive text suitable for a syllabus or lesson plan. Ensure the content is clear, concise, and logically organized.

Course Objectives: {{{courseObjectives}}}

Course Topics: {{{courseTopics}}}

Provide the output in a structured format, suitable for direct inclusion in a syllabus or lesson plan. Focus on clarity and logical flow.`,
});

const generateSyllabusOutlineFlow = ai.defineFlow(
  {
    name: 'generateSyllabusOutlineFlow',
    inputSchema: GenerateSyllabusOutlineInputSchema,
    outputSchema: GenerateSyllabusOutlineOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
