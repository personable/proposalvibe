// @ts-nocheck
// TODO: Fix TS errors and remove the Nocheck
"use client";

import React, { useState } from "react";
import { categorizeInformationAction, transcribeAudioAction } from "./actions";
import AudioRecorder from "@/components/audio-recorder";
import CategoryCard from "@/components/category-card";
import LineItemModal from "@/components/line-item-modal";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ClipboardList, User, CalendarClock, DollarSign, PlusCircle } from "lucide-react";
import type { CategorizeInformationOutput } from "@/ai/flows/categorize-information";
import { useToast } from "@/hooks/use-toast";
import type { LineItem } from "@/types";


export default function Home() {
  const [transcribedText, setTranscribedText] = useState<string | null>(null);
  const [categorizedInfo, setCategorizedInfo] = useState<CategorizeInformationOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCategorizing, setIsCategorizing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const { toast } = useToast();

  const handleRecordingComplete = async (audioDataUri: string) => {
    if (!audioDataUri) {
      toast({
        title: "Recording Error",
        description: "No audio data received.",
        variant: "destructive",
      });
      return;
    }
    setIsLoading(true);
    setTranscribedText(null); // Clear previous transcription
    setCategorizedInfo(null); // Clear previous categories
    setLineItems([]); // Clear previous line items
    setIsModalOpen(false); // Ensure modal is closed

    try {
      // 1. Transcribe Audio
       toast({ title: "Transcribing...", description: "Analyzing your speech." });
      const transcriptionResult = await transcribeAudioAction({ audioDataUri });
      if (transcriptionResult && transcriptionResult.transcription) {
        setTranscribedText(transcriptionResult.transcription);
         toast({ title: "Transcription Complete", description: "Categorizing information..." });
        setIsLoading(false); // Stop loading after transcription
        setIsCategorizing(true); // Start categorizing indicator

        // 2. Categorize Information
        const categorizationResult = await categorizeInformationAction({
          transcribedText: transcriptionResult.transcription,
        });
        setCategorizedInfo(categorizationResult);
         toast({ title: "Categorization Complete!", description: "Job details sorted." });
      } else {
        throw new Error("Transcription failed or returned empty.");
      }
    } catch (error) {
      console.error("Error during processing:", error);
      toast({
        title: "Processing Error",
        description: `An error occurred: ${error instanceof Error ? error.message : String(error)}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setIsCategorizing(false);
    }
  };

   const renderSkeleton = () => (
    <div className="grid md:grid-cols-2 gap-6 mt-8">
      <Skeleton className="h-32 rounded-lg" />
      <Skeleton className="h-32 rounded-lg" />
      <Skeleton className="h-32 rounded-lg" />
      <Skeleton className="h-32 rounded-lg" />
    </div>
  );

  const handleAddLineItem = (newItem: Omit<LineItem, 'id'>) => {
    setLineItems((prevItems) => [...prevItems, { ...newItem, id: Date.now() }]); // Use timestamp as simple ID
  };

  const addLineItemButton = (
      <Button
          variant="outline"
          size="sm"
          className="mt-4 text-accent hover:text-accent-foreground hover:bg-accent/10 border-accent/50"
          onClick={() => setIsModalOpen(true)}
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Line Items
      </Button>
  );


  return (
    <main className="container mx-auto px-4 py-12 max-w-4xl">
      <header className="text-center mb-10">
        <h1 className="text-4xl font-bold tracking-tight text-primary mb-2">JobTalk Sorter</h1>
        <p className="text-lg text-muted-foreground">
          Record your construction job details and let AI sort them out.
        </p>
      </header>

      <AudioRecorder
        onRecordingComplete={handleRecordingComplete}
        isProcessing={isLoading || isCategorizing}
      />

      {transcribedText && (
         <Card className="mt-8 mb-6 shadow-sm bg-secondary border-secondary-foreground/10">
           <CardHeader>
             <CardTitle className="text-lg text-secondary-foreground">Transcription</CardTitle>
           </CardHeader>
           <CardContent>
             <p className="text-sm text-secondary-foreground italic">{transcribedText}</p>
           </CardContent>
         </Card>
       )}


      {isLoading && !transcribedText && renderSkeleton()}
      {isCategorizing && renderSkeleton()}


      {!isLoading && !isCategorizing && categorizedInfo && (
         <div className="grid md:grid-cols-2 gap-6 mt-8">
            <CategoryCard
              title="Scope of Work"
              icon={ClipboardList}
              content={categorizedInfo.scopeOfWork}
            />
            <CategoryCard
              title="Contact Information"
              icon={User}
              content={categorizedInfo.contactInformation}
            />
            <CategoryCard
              title="Timeline"
              icon={CalendarClock}
              content={categorizedInfo.timeline}
            />
            <CategoryCard
              title="Budget"
              icon={DollarSign}
              content={categorizedInfo.budget}
              actionButton={addLineItemButton} // Pass the button here
            />
          </div>
        )}

        {!isLoading && !isCategorizing && !transcribedText && !categorizedInfo && (
            <div className="text-center text-muted-foreground mt-12">
                <p>Click the microphone button to start recording job details.</p>
            </div>
        )}

      <LineItemModal
        isOpen={isModalOpen}
        onOpenChange={setIsModalOpen}
        lineItems={lineItems}
        onAddLineItem={handleAddLineItem}
      />
    </main>
  );
}
