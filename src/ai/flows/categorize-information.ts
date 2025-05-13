"use server";

/**
 * @fileOverview This file defines a Genkit flow for categorizing transcribed text from construction job conversations.
 * It extracts information related to 'Scope of Work', 'Contact Information', 'Timeline', and 'Budget'.
 * For 'Scope of Work' and 'Timeline', it rewrites the information into professional, concise paragraphs suitable for customer communication.
 * For 'Contact Information', it extracts and formats details into distinct fields and attempts to complete partial addresses.
 *
 * - categorizeInformation - A function that categorizes and potentially rewrites input text.
 * - CategorizeInformationInput - The input type for the categorizeInformation function.
 * - CategorizeInformationOutput - The return type for the categorizeInformation function.
 */

import { ai } from "@/ai/ai-instance";
import { z } from "genkit";

const CategorizeInformationInputSchema = z.object({
  transcribedText: z
    .string()
    .describe("The transcribed text to be categorized."),
});
export type CategorizeInformationInput = z.infer<
  typeof CategorizeInformationInputSchema
>;

const ContactInfoSchema = z
  .object({
    name: z
      .string()
      .describe(
        'Extracted contact name(s). Return "Not mentioned" if none found.'
      ),
    address: z
      .string()
      .describe(
        'Extracted full address. Attempt to complete if partial (e.g., add city/state/zip). Return "Not mentioned" if none found.'
      ),
    phone: z
      .string()
      .describe(
        'Extracted phone number(s). Return "Not mentioned" if none found.'
      ),
    email: z
      .string()
      .describe(
        'Extracted email address(es). Return "Not mentioned" if none found.'
      ),
  })
  .describe("Structured contact information extracted from the text.");

const CategorizeInformationOutputSchema = z.object({
  scopeOfWork: z
    .string()
    .describe(
      "Professionally rewritten paragraphs summarizing the project's scope of work, suitable for convincing a customer. Be friendly and down to earth. Avoid business jargon. Emphasize the care that will be taken by the service provider. Emphasize the care that will be taken with the customer property. Return 'Not mentioned' if no scope information found."
    ),
  contactInformation: ContactInfoSchema,
  timeline: z
    .string()
    .describe(
      'Professionally rewritten paragraphs summarizing the project timeline, suitable for convincing a customer. Be friendly and down to earth. Avoid business jargon. Return "Not mentioned" if no timeline information found.'
    ),
  budget: z
    .string()
    .describe(
      'Extracted budget or cost-related information. Return "Not mentioned" if no budget information found.'
    ),
});
export type CategorizeInformationOutput = z.infer<
  typeof CategorizeInformationOutputSchema
>;

export async function categorizeInformation(
  input: CategorizeInformationInput
): Promise<CategorizeInformationOutput> {
  return categorizeInformationFlow(input);
}

const prompt = ai.definePrompt({
  name: "categorizeInformationPrompt",
  input: {
    schema: z.object({
      transcribedText: z
        .string()
        .describe("The transcribed text to be categorized."),
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

Categorize the information into the following sections and structure the output as a JSON object matching the provided schema:

1.  **scopeOfWork**: Identify all details related to the project's tasks, deliverables, and objectives. Rewrite this information into professional-sounding paragraphs that instill customer confidence. If no scope details are found, set this field to "Not mentioned".
2.  **contactInformation**: Extract any names, phone numbers, email addresses, company affiliations, and physical addresses mentioned. Structure this as an object with the following keys: 'name', 'address', 'phone', 'email'.
    *   For the 'address' field: If an address is mentioned but seems incomplete (e.g., missing city, state, or zip code), use your knowledge to try and complete it based on the available information like street name and potentially mentioned city/region. If you cannot confidently complete it, provide the address as extracted.
    *   For each key ('name', 'address', 'phone', 'email'): If the corresponding information is not found in the text, set the value for that key to "Not mentioned".
3.  **timeline**: Identify all dates, deadlines, durations, or scheduling mentions. Rewrite this information into professional-sounding paragraphs outlining the expected timeframe, conveying efficiency and reliability. If no timeline details are found, set this field to "Not mentioned".
4.  **budget**: Extract any cost estimates, payment terms, or financial details mentioned. List them clearly. If no budget details are found, set this field to "Not mentioned".

Output the results strictly in JSON format according to the provided output schema. Ensure the 'scopeOfWork' and 'timeline' fields contain the rewritten professional paragraphs, and 'contactInformation' is an object containing the extracted (and potentially completed/formatted) details or "Not mentioned" for each field.
`,
});

const categorizeInformationFlow = ai.defineFlow<
  typeof CategorizeInformationInputSchema,
  typeof CategorizeInformationOutputSchema
>(
  {
    name: "categorizeInformationFlow",
    inputSchema: CategorizeInformationInputSchema,
    outputSchema: CategorizeInformationOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    // Handle potential null or undefined output gracefully
    if (!output) {
      throw new Error("AI prompt did not return the expected output.");
    }
    // Ensure all fields exist, providing defaults based on the schema if necessary
    return {
      scopeOfWork: output.scopeOfWork || "Not mentioned",
      contactInformation: {
        name: output.contactInformation?.name || "Not mentioned",
        address: output.contactInformation?.address || "Not mentioned",
        phone: output.contactInformation?.phone || "Not mentioned",
        email: output.contactInformation?.email || "Not mentioned",
      },
      timeline: output.timeline || "Not mentioned",
      budget: output.budget || "Not mentioned",
    };
  }
);
