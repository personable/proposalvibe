'use server';

/**
 * @fileOverview This file defines a Genkit flow for categorizing transcribed text from construction job conversations.
 * It extracts information related to 'Scope of Work', 'Contact Information', 'Timeline', and 'Budget'.
 * For 'Scope of Work' and 'Timeline', it rewrites the information into professional, concise paragraphs suitable for customer communication.
 *
 * - categorizeInformation - A function that categorizes and potentially rewrites input text.
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
  scopeOfWork: z.string().describe("A professionally rewritten, concise paragraph summarizing the project's scope of work, suitable for convincing a customer."),
  contactInformation: z.string().describe('Extracted contact information (names, phone numbers, emails).'),
  timeline: z.string().describe('A professionally rewritten, concise paragraph summarizing the project timeline, suitable for convincing a customer.'),
  budget: z.string().describe('Extracted budget or cost-related information.'),
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
    schema: CategorizeInformationOutputSchema, // Use the updated schema
  },
  prompt: `You are an AI assistant specializing in analyzing transcribed text from construction job conversations. Your task is to categorize the information and present it professionally.

Analyze the following transcribed text:
'''
{{{transcribedText}}}
'''

Categorize the information into the following sections:

1.  **Scope of Work**: Identify all details related to the project's tasks, deliverables, and objectives. Then, rewrite this information into a single, concise, professional-sounding paragraph. This paragraph should instill confidence in the customer regarding the understanding of the work required.
2.  **Contact Information**: Extract any names, phone numbers, email addresses, or company affiliations mentioned. List them clearly.
3.  **Timeline**: Identify all dates, deadlines, durations, or scheduling mentions. Then, rewrite this information into a single, concise, professional-sounding paragraph outlining the expected timeframe. This paragraph should convey efficiency and reliability to the customer.
4.  **Budget**: Extract any cost estimates, payment terms, or financial details mentioned. List them clearly.

If information for a specific category is not found in the text, indicate that clearly (e.g., "Not mentioned" or leave the field blank in the JSON).

Output the results in JSON format according to the provided output schema. Ensure the 'scopeOfWork' and 'timeline' fields contain the rewritten professional paragraphs.
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
  // Handle potential null or undefined output gracefully
  if (!output) {
      throw new Error("AI prompt did not return the expected output.");
  }
  // Ensure all fields exist, even if empty, to match the schema
  return {
      scopeOfWork: output.scopeOfWork || "",
      contactInformation: output.contactInformation || "",
      timeline: output.timeline || "",
      budget: output.budget || "",
  };
});
