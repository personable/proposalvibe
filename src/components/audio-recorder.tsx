// @ts-nocheck
// TODO: Fix TS errors and remove the Nocheck
"use client";

import React, { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Mic, StopCircle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AudioRecorderProps {
  onRecordingComplete: (audioDataUri: string) => void;
  isProcessing: boolean;
}

const AudioRecorder: React.FC<AudioRecorderProps> = ({
  onRecordingComplete,
  isProcessing,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioStream, setAudioStream] = useState<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const { toast } = useToast();

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setAudioStream(stream);
      setIsRecording(true);
      audioChunksRef.current = [];

      const options = { mimeType: "audio/webm" }; // Common format, change if needed
      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: options.mimeType });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
          const base64AudioDataUri = reader.result as string;
          onRecordingComplete(base64AudioDataUri);
        };
        stream.getTracks().forEach((track) => track.stop()); // Stop the stream tracks
        setAudioStream(null);
      };

      mediaRecorder.start();
       toast({ title: "Recording started", description: "Speak clearly into your microphone." });
    } catch (error) {
      console.error("Error accessing microphone:", error);
       toast({
         title: "Microphone Error",
         description: "Could not access the microphone. Please check permissions.",
         variant: "destructive",
       });
      setIsRecording(false);
    }
  }, [onRecordingComplete, toast]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
       toast({ title: "Recording stopped", description: "Processing audio..." });
    }
  }, [isRecording, toast]);

  return (
    <div className="flex justify-center items-center my-6">
      <Button
        onClick={isRecording ? stopRecording : startRecording}
        disabled={isProcessing}
        size="lg"
        className="w-24 h-24 rounded-full shadow-lg transition-transform transform hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed bg-gradient-to-br from-accent to-teal-600 hover:from-accent/90 hover:to-teal-600/90 text-accent-foreground"
        aria-label={isRecording ? "Stop Recording" : "Start Recording"}
      >
        {isProcessing ? (
          <Loader2 className="h-10 w-10 animate-spin" />
        ) : isRecording ? (
          <StopCircle className="h-10 w-10" />
        ) : (
          <Mic className="h-10 w-10" />
        )}
      </Button>
    </div>
  );
};

export default AudioRecorder;
