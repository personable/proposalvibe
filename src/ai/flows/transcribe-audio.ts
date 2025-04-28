'use server';
/**
 * @fileOverview This file defines a Genkit flow for transcribing audio input to text.
 *
 * - transcribeAudio - A function that transcribes audio to text.
 * - TranscribeAudioInput - The input type for the transcribeAudio function.
 * - TranscribeAudioOutput - The return type for the transcribeAudio function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const TranscribeAudioInputSchema = z.object({
  audioDataUri: z
    .string()
    .describe(
      "The audio data as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type TranscribeAudioInput = z.infer<typeof TranscribeAudioInputSchema>;

const TranscribeAudioOutputSchema = z.object({
  transcription: z.string().describe('The transcribed text from the audio.'),
});
export type TranscribeAudioOutput = z.infer<typeof TranscribeAudioOutputSchema>;

export async function transcribeAudio(input: TranscribeAudioInput): Promise<TranscribeAudioOutput> {
  return transcribeAudioFlow(input);
}

const transcribeAudioPrompt = ai.definePrompt({
  name: 'transcribeAudioPrompt',
  input: {
    schema: z.object({
      audioDataUri: z
        .string()
        .describe(
          "The audio data as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
        ),
    }),
  },
  output: {
    schema: z.object({
      transcription: z.string().describe('The transcribed text from the audio.'),
    }),
  },
  prompt: `Transcribe the following audio to text:\n\n{{media url=audioDataUri}}`,
});

const transcribeAudioFlow = ai.defineFlow<
  typeof TranscribeAudioInputSchema,
  typeof TranscribeAudioOutputSchema
>(
  {
    name: 'transcribeAudioFlow',
    inputSchema: TranscribeAudioInputSchema,
    outputSchema: TranscribeAudioOutputSchema,
  },
  async input => {
    const {output} = await transcribeAudioPrompt(input);
    return output!;
  }
);
