// @ts-nocheck
// TODO: Fix TS errors and remove the Nocheck
"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Mic, StopCircle, Loader2, Ear } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Extend window type for SpeechRecognition
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}

interface AudioRecorderProps {
  onRecordingComplete: (audioDataUri: string) => void;
  isProcessing: boolean;
}

const AudioRecorder: React.FC<AudioRecorderProps> = ({
  onRecordingComplete,
  isProcessing,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [lastWord, setLastWord] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const speechRecognitionRef = useRef<SpeechRecognition | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const { toast } = useToast();

  const cleanupSpeechRecognition = () => {
    if (speechRecognitionRef.current) {
      speechRecognitionRef.current.stop();
      speechRecognitionRef.current.onresult = null;
      speechRecognitionRef.current.onerror = null;
      speechRecognitionRef.current.onend = null;
      speechRecognitionRef.current = null;
    }
    setLastWord(null); // Clear last word when stopping/cleaning up
  };

  const startRecording = useCallback(async () => {
    setIsRecording(true);
    setLastWord(null); // Clear previous last word
    audioChunksRef.current = [];

    // --- MediaRecorder Setup (for final audio blob) ---
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const options = { mimeType: "audio/webm" }; // Or other supported type
      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: options.mimeType,
        });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
          const base64AudioDataUri = reader.result as string;
          onRecordingComplete(base64AudioDataUri);
        };
        stream.getTracks().forEach((track) => track.stop()); // Stop the media stream tracks
      };

      mediaRecorder.start();
      toast({
        title: "Recording started",
        description: "Speak clearly into your microphone.",
      });
    } catch (error) {
      console.error("Error accessing microphone for MediaRecorder:", error);
      toast({
        title: "Microphone Error",
        description:
          "Could not access the microphone for recording. Please check permissions.",
        variant: "destructive",
      });
      setIsRecording(false);
      cleanupSpeechRecognition(); // Ensure cleanup if MediaRecorder fails
      return; // Stop if we can't record audio
    }

    // --- SpeechRecognition Setup (for live feedback) ---
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        speechRecognitionRef.current = recognition;
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = "en-US"; // Or make configurable

        recognition.onresult = (event: SpeechRecognitionEvent) => {
          let interimTranscript = "";
          let finalTranscript = "";

          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              finalTranscript += event.results[i][0].transcript;
            } else {
              interimTranscript += event.results[i][0].transcript;
            }
          }

          const currentTranscript = finalTranscript || interimTranscript;
          const words = currentTranscript.trim().split(/\s+/);
          const latestWord = words.pop() || null;

          // Update last word only if it's different and not empty
          if (latestWord && latestWord !== lastWord) {
            setLastWord(latestWord);
          }
        };

        recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
          console.error(
            "Speech recognition error:",
            event.error,
            event.message
          );
          // Don't toast every error, can be noisy (e.g., 'no-speech')
          if (event.error !== "no-speech" && event.error !== "aborted") {
            toast({
              title: "Speech Recognition Error",
              description: `Could not process speech: ${event.error}`,
              variant: "destructive",
            });
          }
          // Don't stop recording, just stop recognition feedback
          cleanupSpeechRecognition();
        };

        recognition.onend = () => {
          // Check if it ended naturally while still supposed to be recording
          if (isRecording && speechRecognitionRef.current) {
            console.log("Speech recognition ended prematurely, restarting...");
            // Optionally restart it, but be careful of infinite loops on errors
            // recognition.start();
          } else {
            // Normal end or stopped manually
            console.log("Speech recognition ended.");
          }
        };

        recognition.start();
        console.log("Speech recognition started.");
      } catch (err) {
        console.error("Failed to initialize SpeechRecognition:", err);
        toast({
          title: "Browser Feature Error",
          description:
            "Live speech feedback is not supported or failed to start.",
          variant: "default",
        });
        speechRecognitionRef.current = null; // Ensure it's null if setup fails
      }
    } else {
      console.warn("SpeechRecognition API not supported in this browser.");
      toast({
        title: "Browser Feature Note",
        description: "Live speech feedback is not supported in this browser.",
        variant: "default",
      });
    }
  }, [onRecordingComplete, toast, lastWord]); // Added lastWord dependency for comparison

  const stopRecording = useCallback(() => {
    // Stop MediaRecorder first
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop(); // onstop will handle the rest
      mediaRecorderRef.current = null;
      toast({ title: "Recording stopped", description: "Processing audio..." });
    }
    // Stop SpeechRecognition
    cleanupSpeechRecognition();
    setIsRecording(false);
  }, [isRecording, toast]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (
        mediaRecorderRef.current &&
        mediaRecorderRef.current.state === "recording"
      ) {
        mediaRecorderRef.current.stop();
      }
      cleanupSpeechRecognition();
      // Stop any associated media streams
      // (Handled in mediaRecorder.onstop, but good practice for safety)
      if (mediaRecorderRef.current?.stream) {
        mediaRecorderRef.current.stream
          .getTracks()
          .forEach((track) => track.stop());
      }
    };
  }, []);

  return (
    <div className="flex flex-col justify-center items-center">
      <Button
        onClick={isRecording ? stopRecording : startRecording}
        disabled={isProcessing}
        size="lg"
        className={`w-24 h-24 rounded-full shadow-lg transition-transform transform hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed text-accent-foreground ${
          isRecording
            ? "bg-gradient-to-br from-red-500 to-red-700 hover:from-red-500/90 hover:to-red-700/90"
            : "bg-gradient-to-br from-accent to-blue-700 hover:from-accent/90 hover:to-blue-700/90" // Adjusted end color for gradient
        }`}
        aria-label={isRecording ? "Stop Recording" : "Start Recording"}
      >
        {isProcessing ? (
          <Loader2 className="h-10 w-10 animate-spin" />
        ) : isRecording ? (
          <StopCircle className="h-10 w-10" />
        ) : (
          <Mic className="h-12 w-12" />
        )}
      </Button>

      {isRecording && (
        <p
          className="absolute left-0 right-0 animate-ping opacity-80 text-muted-foreground flex items-center uppercase text-2xl justify-center gap-1.5"
          style={{ bottom: "125%", pointerEvents: "none" }}
        >
          {lastWord ? lastWord : "Recording..."}
        </p>
      )}
      {isProcessing && <div className="h-6 mt-4"></div> /* Placeholder */}
    </div>
  );
};

export default AudioRecorder;
