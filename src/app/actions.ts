'use server';

import { transcribeAudio, type TranscribeAudioInput, type TranscribeAudioOutput } from '@/ai/flows/transcribe-audio';
import { categorizeInformation, type CategorizeInformationInput, type CategorizeInformationOutput } from '@/ai/flows/categorize-information';

export async function transcribeAudioAction(
  input: TranscribeAudioInput
): Promise<TranscribeAudioOutput> {
  console.log('Transcribing audio with data URI length:', input.audioDataUri?.length);
  try {
    // Validate audio data URI format before processing
    const dataUriPattern = /^data:audio\/(webm|wav|ogg|mp3);base64,([a-zA-Z0-9+/]+=*)$/;
    if (!dataUriPattern.test(input.audioDataUri)) {
      throw new Error('Invalid audio data URI format');
    }

    const result = await transcribeAudio(input);
    console.log('Transcription successful:', result);
    return result;
  } catch (error) {
    console.error('Error in transcribeAudioAction:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to transcribe audio: ${errorMessage}`);
  }
}

export async function categorizeInformationAction(
  input: CategorizeInformationInput
): Promise<CategorizeInformationOutput> {
   console.log('Categorizing text:', input.transcribedText);
  try {
    const result = await categorizeInformation(input);
    console.log('Categorization successful:', result);
    return result;
  } catch (error) {
     console.error('Error in categorizeInformationAction:', error);
     throw new Error(`Failed to categorize information: ${error instanceof Error ? error.message : String(error)}`);
  }
}