"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Mic, StopCircle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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
    setLastWord(null);
  };

  const validateAudioDataUri = (dataUri: string): boolean => {
    const dataUriPattern = /^data:audio\/(webm|wav|ogg|mp3);base64,([a-zA-Z0-9+/]+=*)$/;
    return dataUriPattern.test(dataUri);
  };

  const startRecording = useCallback(async () => {
    setIsRecording(true);
    setLastWord(null);
    audioChunksRef.current = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const options = { mimeType: "audio/webm" };
      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        try {
          const audioBlob = new Blob(audioChunksRef.current, {
            type: options.mimeType,
          });
          const reader = new FileReader();
          reader.readAsDataURL(audioBlob);
          reader.onloadend = () => {
            const base64AudioDataUri = reader.result as string;
            if (!validateAudioDataUri(base64AudioDataUri)) {
              throw new Error("Invalid audio data URI format");
            }
            onRecordingComplete(base64AudioDataUri);
          };
          stream.getTracks().forEach((track) => track.stop());
        } catch (error) {
          console.error("Error processing audio data:", error);
          toast({
            title: "Processing Error",
            description: "Failed to process audio recording. Please try again.",
            variant: "destructive",
          });
        }
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
      cleanupSpeechRecognition();
      return;
    }

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        speechRecognitionRef.current = recognition;
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = "en-US";

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
          if (event.error !== "no-speech" && event.error !== "aborted") {
            toast({
              title: "Speech Recognition Error",
              description: `Could not process speech: ${event.error}`,
              variant: "destructive",
            });
          }
          cleanupSpeechRecognition();
        };

        recognition.onend = () => {
          if (isRecording && speechRecognitionRef.current) {
            console.log("Speech recognition ended prematurely, restarting...");
          } else {
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
        speechRecognitionRef.current = null;
      }
    } else {
      console.warn("SpeechRecognition API not supported in this browser.");
      toast({
        title: "Browser Feature Note",
        description: "Live speech feedback is not supported in this browser.",
        variant: "default",
      });
    }
  }, [onRecordingComplete, toast, lastWord]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current = null;
      toast({ title: "Recording stopped", description: "Processing audio..." });
    }
    cleanupSpeechRecognition();
    setIsRecording(false);
  }, [isRecording, toast]);

  useEffect(() => {
    return () => {
      if (
        mediaRecorderRef.current &&
        mediaRecorderRef.current.state === "recording"
      ) {
        mediaRecorderRef.current.stop();
      }
      cleanupSpeechRecognition();
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
            : "bg-gradient-to-br from-accent to-blue-700 hover:from-accent/90 hover:to-blue-700/90"
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
      {isProcessing && <div className="h-6 mt-4"></div>}
    </div>
  );
};

export default AudioRecorder;