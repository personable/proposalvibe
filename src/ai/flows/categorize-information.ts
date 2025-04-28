'use server';

/**
 * @fileOverview This file defines a Genkit flow for categorizing transcribed text into 'Scope of Work', 'Contact Information', 'Timeline', and 'Budget'.
 *
 * - categorizeInformation - A function that categorizes input text.
 * - CategorizeInformationInput - The input type for the categorizeInformation function.
 * - CategorizeInformationOutput - The return type for the categorizeInformation function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const CategorizeInformationInputSchema = z.object({
  transcribedText: z
    .string()
    .describe('The transcribed text to be categorized.'),
});
export type CategorizeInformationInput = z.infer<typeof CategorizeInformationInputSchema>;

const CategorizeInformationOutputSchema = z.object({
  scopeOfWork: z.string().describe('Information related to the scope of work.'),
  contactInformation: z.string().describe('Contact information extracted from the text.'),
  timeline: z.string().describe('Timeline or schedule information.'),
  budget: z.string().describe('Budget or cost-related information.'),
});
export type CategorizeInformationOutput = z.infer<typeof CategorizeInformationOutputSchema>;

export async function categorizeInformation(input: CategorizeInformationInput): Promise<CategorizeInformationOutput> {
  return categorizeInformationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'categorizeInformationPrompt',
  input: {
    schema: z.object({
      transcribedText: z
        .string()
        .describe('The transcribed text to be categorized.'),
    }),
  },
  output: {
    schema: z.object({
      scopeOfWork: z.string().describe('Information related to the scope of work.'),
      contactInformation: z.string().describe('Contact information extracted from the text.'),
      timeline: z.string().describe('Timeline or schedule information.'),
      budget: z.string().describe('Budget or cost-related information.'),
    }),
  },
  prompt: `You are an AI assistant that analyzes transcribed text from construction job conversations and categorizes the information into the following categories:

- Scope of Work: Details about the project's tasks, deliverables, and objectives.
- Contact Information: Names, phone numbers, email addresses, and company affiliations of people involved.
- Timeline: Dates, deadlines, and durations mentioned in the conversation.
- Budget: Cost estimates, payment terms, and financial details.

Analyze the following transcribed text and extract relevant information for each category. If a category is not mentioned, leave that section blank.

Transcribed Text: {{{transcribedText}}}

Output the information in JSON format.
`,
});

const categorizeInformationFlow = ai.defineFlow<
  typeof CategorizeInformationInputSchema,
  typeof CategorizeInformationOutputSchema
>({
  name: 'categorizeInformationFlow',
  inputSchema: CategorizeInformationInputSchema,
  outputSchema: CategorizeInformationOutputSchema,
}, async input => {
  const {output} = await prompt(input);
  return output!;
});