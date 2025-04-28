'use server';

/**
 * @fileOverview This file defines a Genkit flow for categorizing transcribed text from construction job conversations.
 * It extracts information related to 'Scope of Work', 'Contact Information', 'Timeline', and 'Budget'.
 * For 'Scope of Work' and 'Timeline', it rewrites the information into professional, concise paragraphs suitable for customer communication.
 * For 'Contact Information', it formats the details and attempts to complete partial addresses.
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
  contactInformation: z.string().describe('Formatted contact information (Name, Address, Phone, Email). Address details like zip code should be completed if possible based on context.'),
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
2.  **Contact Information**: Extract any names, phone numbers, email addresses, company affiliations, and physical addresses mentioned. Format the extracted information clearly as follows, filling in each field only if the information is present in the text:
    \`\`\`
    Name: [Extracted Name(s)]
    Address: [Extracted Address]
    Phone: [Extracted Phone Number(s)]
    Email: [Extracted Email Address(es)]
    \`\`\`
    If an address is mentioned but seems incomplete (e.g., missing city, state, or zip code), use your knowledge to try and complete it based on the available information like street name and potentially mentioned city/region. If you cannot confidently complete the address, present the information as extracted in the Address field. If no information is found for a field (Name, Address, Phone, Email), state "Not mentioned" for that specific field within the formatted structure.
3.  **Timeline**: Identify all dates, deadlines, durations, or scheduling mentions. Then, rewrite this information into a single, concise, professional-sounding paragraph outlining the expected timeframe. This paragraph should convey efficiency and reliability to the customer.
4.  **Budget**: Extract any cost estimates, payment terms, or financial details mentioned. List them clearly. If not mentioned, state "Not mentioned".

If information for a specific category (Scope of Work, Timeline, Budget) is not found in the text, the corresponding field in the JSON output should clearly indicate this (e.g., "Not mentioned" or an empty string). For Contact Information, follow the specific formatting instructions above.

Output the results in JSON format according to the provided output schema. Ensure the 'scopeOfWork' and 'timeline' fields contain the rewritten professional paragraphs, and 'contactInformation' contains the formatted details.
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
  // Ensure all fields exist, even if empty or "Not mentioned", to match the schema
  return {
      scopeOfWork: output.scopeOfWork || "Not mentioned",
      contactInformation: output.contactInformation || "Name: Not mentioned\nAddress: Not mentioned\nPhone: Not mentioned\nEmail: Not mentioned", // Default formatted string
      timeline: output.timeline || "Not mentioned",
      budget: output.budget || "Not mentioned",
  };
});
