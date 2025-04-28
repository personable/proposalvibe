
// @ts-nocheck
// TODO: Fix TS errors and remove the Nocheck
"use client";

import React, { useState, useCallback, useEffect } from "react";
import Image from 'next/image'; // Import next/image
import { categorizeInformationAction, transcribeAudioAction } from "./actions";
import AudioRecorder from "@/components/audio-recorder";
import CategoryCard from "@/components/category-card";
import LineItemModal from "@/components/line-item-modal";
import LineItemTable from "@/components/line-item-table";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ClipboardList, User, CalendarClock, DollarSign, PlusCircle, Pencil, Upload, X } from "lucide-react";
import type { CategorizeInformationOutput } from "@/ai/flows/categorize-information";
import { useToast } from "@/hooks/use-toast";
import type { LineItem } from "@/types";
import { cn } from "@/lib/utils";


const MAX_IMAGES = 5;

export default function Home() {
  const [transcribedText, setTranscribedText] = useState<string | null>(null);
  const [categorizedInfo, setCategorizedInfo] = useState<CategorizeInformationOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCategorizing, setIsCategorizing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [scopeImages, setScopeImages] = useState<string[]>([]); // State for image data URIs

  // State for individual contact fields
  const [contactName, setContactName] = useState('');
  const [contactAddress, setContactAddress] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactEmail, setContactEmail] = useState('');

  const { toast } = useToast();

   // Effect to update contact input fields when categorizedInfo changes
   useEffect(() => {
    if (categorizedInfo?.contactInformation) {
      setContactName(categorizedInfo.contactInformation.name || '');
      setContactAddress(categorizedInfo.contactInformation.address || '');
      setContactPhone(categorizedInfo.contactInformation.phone || '');
      setContactEmail(categorizedInfo.contactInformation.email || '');
    }
  }, [categorizedInfo]);


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
    setScopeImages([]); // Clear previous images
    setIsModalOpen(false); // Ensure modal is closed
    // Clear contact fields
    setContactName('');
    setContactAddress('');
    setContactPhone('');
    setContactEmail('');


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
    <div className="space-y-6 mt-8"> {/* Changed to vertical stack */}
      <Skeleton className="h-40 rounded-lg" /> {/* Increased height */}
      <Skeleton className="h-40 rounded-lg" />
      <Skeleton className="h-40 rounded-lg" />
      <Skeleton className="h-40 rounded-lg" />
    </div>
  );

  const handleAddLineItem = (newItem: Omit<LineItem, 'id'>) => {
    setLineItems((prevItems) => [...prevItems, { ...newItem, id: Date.now() }]); // Use timestamp as simple ID
  };

  // Generic handler for Scope, Timeline, Budget textareas
  const handleCategoryChange = useCallback((category: keyof CategorizeInformationOutput, value: string) => {
    setCategorizedInfo(prev => {
      if (!prev) return null;
      // Exclude contactInformation from this handler
      if (category === 'contactInformation') return prev;
      return { ...prev, [category]: value };
    });
  }, []);

   // Specific handler for Contact Information inputs
  const handleContactChange = useCallback((field: keyof CategorizeInformationOutput['contactInformation'], value: string) => {
      // Update the specific input field's state
     if (field === 'name') setContactName(value);
     else if (field === 'address') setContactAddress(value);
     else if (field === 'phone') setContactPhone(value);
     else if (field === 'email') setContactEmail(value);


     // Update the main categorizedInfo state
      setCategorizedInfo(prev => {
          if (!prev) return null;
          return {
              ...prev,
              contactInformation: {
                  ...prev.contactInformation,
                  [field]: value,
              },
          };
      });
  }, []);

  // Handler for image selection
  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const currentImageCount = scopeImages.length;
    const filesToProcess = Array.from(files).slice(0, MAX_IMAGES - currentImageCount);

    if (files.length + currentImageCount > MAX_IMAGES) {
      toast({
        title: "Image Limit Exceeded",
        description: `You can only attach up to ${MAX_IMAGES} images.`,
        variant: "destructive",
      });
    }

    filesToProcess.forEach(file => {
      if (!file.type.startsWith('image/')) {
         toast({
            title: "Invalid File Type",
            description: `File "${file.name}" is not an image.`,
            variant: "destructive",
         });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setScopeImages(prev => [...prev, reader.result as string]);
        }
      };
      reader.onerror = () => {
        console.error("Error reading file:", file.name);
         toast({
            title: "File Read Error",
            description: `Could not read file "${file.name}".`,
            variant: "destructive",
         });
      }
      reader.readAsDataURL(file);
    });

    // Reset file input value to allow selecting the same file again
    event.target.value = '';
  };

  // Handler to remove an image
  const removeImage = (index: number) => {
    setScopeImages(prev => prev.filter((_, i) => i !== index));
  };


  // Button to open the modal - text changes based on whether items exist
  const manageLineItemsButton = (
      <Button
          variant="outline"
          size="sm"
          className="mt-4 text-accent hover:text-accent-foreground hover:bg-accent/10 border-accent/50"
          onClick={() => setIsModalOpen(true)}
        >
          {lineItems.length > 0 ? <Pencil className="mr-2 h-4 w-4" /> : <PlusCircle className="mr-2 h-4 w-4" />}
          {lineItems.length > 0 ? 'View/Edit Line Items' : 'Add Line Items'}
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
         <div className="space-y-6 mt-8"> {/* Changed to vertical stack */}
            <CategoryCard
             title="Contact Information"
             icon={User}
             // Remove isEditable and value/onChange, use content for custom layout
           >
               <div className="space-y-3"> {/* Add spacing between inputs */}
                <div>
                  <Label htmlFor="contact-name" className="text-xs font-medium text-muted-foreground">Name</Label>
                  <Input
                    id="contact-name"
                    value={contactName === "Not mentioned" ? "" : contactName}
                    onChange={(e) => handleContactChange('name', e.target.value)}
                    placeholder="Enter name..."
                    className="mt-1 h-9 text-sm"
                  />
                </div>
                <div>
                  <Label htmlFor="contact-address" className="text-xs font-medium text-muted-foreground">Address</Label>
                  <Input
                    id="contact-address"
                    value={contactAddress === "Not mentioned" ? "" : contactAddress}
                    onChange={(e) => handleContactChange('address', e.target.value)}
                    placeholder="Enter address..."
                     className="mt-1 h-9 text-sm"
                  />
                </div>
                <div>
                  <Label htmlFor="contact-phone" className="text-xs font-medium text-muted-foreground">Phone</Label>
                  <Input
                    id="contact-phone"
                    type="tel"
                    value={contactPhone === "Not mentioned" ? "" : contactPhone}
                    onChange={(e) => handleContactChange('phone', e.target.value)}
                    placeholder="Enter phone..."
                     className="mt-1 h-9 text-sm"
                  />
                </div>
                <div>
                  <Label htmlFor="contact-email" className="text-xs font-medium text-muted-foreground">Email</Label>
                  <Input
                    id="contact-email"
                    type="email"
                    value={contactEmail === "Not mentioned" ? "" : contactEmail}
                    onChange={(e) => handleContactChange('email', e.target.value)}
                    placeholder="Enter email..."
                     className="mt-1 h-9 text-sm"
                  />
                </div>
              </div>
           </CategoryCard>
           <CategoryCard
             title="Scope of Work"
             icon={ClipboardList}
             isEditable
             value={categorizedInfo.scopeOfWork}
             onChange={(value) => handleCategoryChange('scopeOfWork', value)}
           >
              {/* Image Upload and Display Area */}
             <div className="mt-4 border-t pt-4">
                <Label htmlFor="scope-image-input" className={cn(
                  "inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-3 cursor-pointer",
                  scopeImages.length >= MAX_IMAGES && "opacity-50 cursor-not-allowed"
                )}>
                  <Upload className="mr-2 h-4 w-4" />
                  Attach Images ({scopeImages.length}/{MAX_IMAGES})
                </Label>
                <Input
                  id="scope-image-input"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  className="sr-only" // Hide the default input appearance
                  disabled={scopeImages.length >= MAX_IMAGES}
                />
                {scopeImages.length > 0 && (
                  <div className="mt-4 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                    {scopeImages.map((imgSrc, index) => (
                      <div key={index} className="relative group aspect-square">
                        <Image
                          src={imgSrc}
                          alt={`Scope image ${index + 1}`}
                          width={100}
                          height={100}
                          className="object-cover w-full h-full rounded-md border"
                        />
                        <Button
                          variant="destructive"
                          size="icon"
                          className="absolute top-1 right-1 h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity rounded-full p-0.5"
                          onClick={() => removeImage(index)}
                          aria-label={`Remove image ${index + 1}`}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
             </div>
           </CategoryCard>
            <CategoryCard
              title="Timeline"
              icon={CalendarClock}
              isEditable
              value={categorizedInfo.timeline}
              onChange={(value) => handleCategoryChange('timeline', value)}
            />
            <CategoryCard
              title="Budget"
              icon={DollarSign}
              isEditable
              value={categorizedInfo.budget}
              onChange={(value) => handleCategoryChange('budget', value)}
            >
              {/* Additional content for Budget card (Table and Button) passed as children */}
              {lineItems.length > 0 && (
                 <div className="mt-4"> {/* No top border needed here as CategoryCard adds one */}
                     <h4 className="text-sm font-medium mb-2 text-primary">Line Items:</h4>
                    <LineItemTable lineItems={lineItems} />
                 </div>
              )}
               <div className="mt-4">{manageLineItemsButton}</div>
            </CategoryCard>
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
        // onRemoveLineItem={handleRemoveLineItem} // Pass remove function if implemented
      />
    </main>
  );
}
