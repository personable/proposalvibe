// @ts-nocheck
// TODO: Fix TS errors and remove the Nocheck
"use client";

import React, { useState, useCallback, useEffect } from "react";
import Image from "next/image"; // Import next/image
import { categorizeInformationAction, transcribeAudioAction } from "./actions";
import AudioRecorder from "@/components/audio-recorder";
import CategoryCard from "@/components/category-card";
import LineItemModal from "@/components/line-item-modal";
import ImageDetailModal from "@/components/image-detail-modal"; // Import the new modal
import LineItemTable from "@/components/line-item-table";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea"; // Import Textarea for description snippet logic
import {
  ClipboardList,
  User,
  CalendarClock,
  DollarSign,
  PlusCircle,
  Pencil,
  Upload,
  X,
} from "lucide-react";
import type { CategorizeInformationOutput } from "@/ai/flows/categorize-information";
import { useToast } from "@/hooks/use-toast";
import type { LineItem, ImageDetail } from "@/types"; // Import ImageDetail type
import { cn } from "@/lib/utils";

const MAX_IMAGES = 5;

export default function Home() {
  const [transcribedText, setTranscribedText] = useState<string | null>(null);
  const [categorizedInfo, setCategorizedInfo] =
    useState<CategorizeInformationOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCategorizing, setIsCategorizing] = useState(false);
  const [isLineItemModalOpen, setIsLineItemModalOpen] = useState(false);
  const [isImageDetailModalOpen, setIsImageDetailModalOpen] = useState(false); // State for image detail modal
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(
    null
  ); // State for selected image index
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [scopeImages, setScopeImages] = useState<ImageDetail[]>([]); // State now holds ImageDetail objects

  // State for individual contact fields
  const [contactName, setContactName] = useState("");
  const [contactAddress, setContactAddress] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactEmail, setContactEmail] = useState("");

  const { toast } = useToast();

  // Effect to update contact input fields when categorizedInfo changes
  useEffect(() => {
    if (categorizedInfo?.contactInformation) {
      setContactName(categorizedInfo.contactInformation.name || "");
      setContactAddress(categorizedInfo.contactInformation.address || "");
      setContactPhone(categorizedInfo.contactInformation.phone || "");
      setContactEmail(categorizedInfo.contactInformation.email || "");
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
    setIsLineItemModalOpen(false); // Ensure line item modal is closed
    setIsImageDetailModalOpen(false); // Ensure image detail modal is closed
    setSelectedImageIndex(null); // Clear selected image
    // Clear contact fields
    setContactName("");
    setContactAddress("");
    setContactPhone("");
    setContactEmail("");

    try {
      // 1. Transcribe Audio
      toast({
        title: "Transcribing Audio",
        description: "Let's take a look at this job of yours...",
      });
      const transcriptionResult = await transcribeAudioAction({ audioDataUri });
      if (transcriptionResult && transcriptionResult.transcription) {
        setTranscribedText(transcriptionResult.transcription);
        toast({
          title: "Extracting Job Details",
          description:
            "OK, let's sort this stuff out and turn it into a proposal.",
        });
        setIsLoading(false); // Stop loading after transcription
        setIsCategorizing(true); // Start categorizing indicator

        // 2. Categorize Information
        const categorizationResult = await categorizeInformationAction({
          transcribedText: transcriptionResult.transcription,
        });
        setCategorizedInfo(categorizationResult);

        // toast({
        //   title: "Categorization Complete!",
        //   description: "Job details sorted.",
        // });
      } else {
        throw new Error("Transcription failed or returned empty.");
      }
    } catch (error) {
      console.error("Error during processing:", error);
      toast({
        title: "Processing Error",
        description: `An error occurred: ${
          error instanceof Error ? error.message : String(error)
        }`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setIsCategorizing(false);
    }
  };

  const renderSkeleton = () => (
    <div className="space-y-6 mt-8">
      <Skeleton className="rounded-lg h-100 border" />
      <Skeleton className="rounded-lg h-100 border" />
      <Skeleton className="rounded-lg h-100 border" />
      <Skeleton className="rounded-lg h-100 border" />
    </div>
  );

  const handleAddLineItem = (newItem: Omit<LineItem, "id">) => {
    setLineItems((prevItems) => [...prevItems, { ...newItem, id: Date.now() }]); // Use timestamp as simple ID
  };

  // Generic handler for Scope, Timeline, Budget textareas
  const handleCategoryChange = useCallback(
    (category: keyof CategorizeInformationOutput, value: string) => {
      setCategorizedInfo((prev) => {
        if (!prev) return null;
        // Exclude contactInformation from this handler
        if (category === "contactInformation") return prev;
        return { ...prev, [category]: value };
      });
    },
    []
  );

  // Specific handler for Contact Information inputs
  const handleContactChange = useCallback(
    (
      field: keyof CategorizeInformationOutput["contactInformation"],
      value: string
    ) => {
      // Update the specific input field's state
      if (field === "name") setContactName(value);
      else if (field === "address") setContactAddress(value);
      else if (field === "phone") setContactPhone(value);
      else if (field === "email") setContactEmail(value);

      // Update the main categorizedInfo state
      setCategorizedInfo((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          contactInformation: {
            ...prev.contactInformation,
            [field]: value,
          },
        };
      });
    },
    []
  );

  // Handler for image selection
  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const currentImageCount = scopeImages.length;
    const filesToProcess = Array.from(files).slice(
      0,
      MAX_IMAGES - currentImageCount
    );

    if (files.length + currentImageCount > MAX_IMAGES) {
      toast({
        title: "Image Limit Exceeded",
        description: `You can only attach up to ${MAX_IMAGES} images.`,
        variant: "destructive",
      });
    }

    filesToProcess.forEach((file) => {
      if (!file.type.startsWith("image/")) {
        toast({
          title: "Invalid File Type",
          description: `File "${file.name}" is not an image.`,
          variant: "destructive",
        });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          const newImage: ImageDetail = {
            id: Date.now() + Math.random(), // Simple unique ID
            src: reader.result as string,
            description: "", // Initialize with empty description
          };
          setScopeImages((prev) => [...prev, newImage]);
        }
      };
      reader.onerror = () => {
        console.error("Error reading file:", file.name);
        toast({
          title: "File Read Error",
          description: `Could not read file "${file.name}".`,
          variant: "destructive",
        });
      };
      reader.readAsDataURL(file);
    });

    // Reset file input value to allow selecting the same file again
    event.target.value = "";
  };

  // Handler to remove an image by ID
  const removeImage = (idToRemove: number) => {
    setScopeImages((prev) => prev.filter((image) => image.id !== idToRemove));
  };

  // Handler to open the image detail modal
  const openImageModal = (index: number) => {
    setSelectedImageIndex(index);
    setIsImageDetailModalOpen(true);
  };

  // Handler to save description from the modal
  const handleSaveImageDescription = (
    index: number,
    newDescription: string
  ) => {
    setScopeImages((prev) =>
      prev.map((img, i) =>
        i === index ? { ...img, description: newDescription } : img
      )
    );
    setIsImageDetailModalOpen(false); // Close modal after save
    setSelectedImageIndex(null);
  };

  // Function to get the first line of a description
  const getFirstLine = (text: string): string => {
    if (!text) return "";
    return text.split("\n")[0];
  };

  // Button to open the modal - text changes based on whether items exist
  const manageLineItemsButton = (
    <Button
      size="sm"
      variant="outline"
      onClick={() => setIsLineItemModalOpen(true)}
    >
      {lineItems.length > 0 ? (
        <Pencil className="mr-2 h-4 w-4" />
      ) : (
        <PlusCircle className="mr-2 h-4 w-4" />
      )}
      {lineItems.length > 0 ? "View/Edit Line Items" : "Add Line Items"}
    </Button>
  );

  const selectedImageData =
    selectedImageIndex !== null ? scopeImages[selectedImageIndex] : null;

  return (
    <div
      className="container mx-auto px-4 py-8 max-w-2xl"
      style={{
        display: "grid",
        gridTemplateRows: "1fr auto",
        minHeight: "100%",
      }}
    >
      <main style={{ overflowY: "auto" }}>
        {/* Main content area */}
        {!isLoading &&
          !isCategorizing &&
          !transcribedText &&
          !categorizedInfo && (
            <>
              <h1 className="text-2xl mb-10 text-center">
                Talk naturally about your job's{" "}
                <span className="bg-yellow-300 font-bold">
                  Customer Contact Information
                </span>
                , <span className="bg-yellow-300 font-bold">Scope of Work</span>
                , <span className="bg-yellow-300 font-bold">Timeline</span>, and{" "}
                <span className="bg-yellow-300 font-bold">Budget</span>.
              </h1>
              <p className="text-center text-xs mb-6 text-muted-foreground">
                Just like this! 👇
              </p>
              <p className="italic text-muted-foreground bg-muted text-s text-center opacity-80 p-6 rounded-2xl mb-4">
                We're doing this job for Jennifer LaRue at 123 Main St,
                Portland, OR 97201. Work includes replacing the roof and
                installing new gutters. The timeline's about two weeks, and the
                cost is going to be around ten thousand, with one thousand down
                today. You can reach her at (555) 123-4567 or jlarue at gmail.
              </p>
            </>
          )}
        {transcribedText && (
          <Card className="mt-8 mb-6 shadow-sm bg-secondary border-secondary-foreground/10 sr-only">
            <CardHeader>
              <CardTitle className="text-lg text-secondary-foreground">
                Transcription
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-secondary-foreground italic">
                {transcribedText}
              </p>
            </CardContent>
          </Card>
        )}

        {isLoading && !transcribedText && renderSkeleton()}
        {isCategorizing && renderSkeleton()}

        {!isLoading && !isCategorizing && categorizedInfo && (
          <div className="space-y-6 mt-8">
            <CategoryCard title="Contact Information" icon={User}>
              <div className="space-y-3">
                <div>
                  <Label
                    htmlFor="contact-name"
                    className="text-xs font-medium text-muted-foreground"
                  >
                    Name
                  </Label>
                  <Input
                    id="contact-name"
                    value={contactName === "Not mentioned" ? "" : contactName}
                    onChange={(e) =>
                      handleContactChange("name", e.target.value)
                    }
                    placeholder="Enter name..."
                    className="mt-1 h-9 text-sm"
                  />
                </div>
                <div>
                  <Label
                    htmlFor="contact-address"
                    className="text-xs font-medium text-muted-foreground"
                  >
                    Address
                  </Label>
                  <Input
                    id="contact-address"
                    value={
                      contactAddress === "Not mentioned" ? "" : contactAddress
                    }
                    onChange={(e) =>
                      handleContactChange("address", e.target.value)
                    }
                    placeholder="Enter address..."
                    className="mt-1 h-9 text-sm"
                  />
                </div>
                <div>
                  <Label
                    htmlFor="contact-phone"
                    className="text-xs font-medium text-muted-foreground"
                  >
                    Phone
                  </Label>
                  <Input
                    id="contact-phone"
                    type="tel"
                    value={contactPhone === "Not mentioned" ? "" : contactPhone}
                    onChange={(e) =>
                      handleContactChange("phone", e.target.value)
                    }
                    placeholder="Enter phone..."
                    className="mt-1 h-9 text-sm"
                  />
                </div>
                <div>
                  <Label
                    htmlFor="contact-email"
                    className="text-xs font-medium text-muted-foreground"
                  >
                    Email
                  </Label>
                  <Input
                    id="contact-email"
                    type="email"
                    value={contactEmail === "Not mentioned" ? "" : contactEmail}
                    onChange={(e) =>
                      handleContactChange("email", e.target.value)
                    }
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
              onChange={(value) => handleCategoryChange("scopeOfWork", value)}
            >
              {/* Image Upload and Display Area */}
              <div>
                <Label
                  htmlFor="scope-image-input"
                  className={cn(
                    "inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-3 cursor-pointer",
                    scopeImages.length >= MAX_IMAGES &&
                      "opacity-50 cursor-not-allowed"
                  )}
                >
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
                  <div className="mt-4 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
                    {scopeImages.map((image, index) => (
                      <div
                        key={image.id}
                        className="relative group flex flex-col items-center"
                      >
                        <button
                          onClick={() => openImageModal(index)}
                          className="block aspect-square w-full overflow-hidden rounded-md border focus:outline-none focus:ring-2 focus:ring-accent"
                          aria-label={`View image ${index + 1} details`}
                        >
                          <Image
                            src={image.src}
                            alt={`Scope image ${index + 1}`}
                            width={100}
                            height={100}
                            className="object-cover w-full h-full transition-transform group-hover:scale-105"
                          />
                        </button>
                        {/* Close button */}
                        <Button
                          variant="destructive"
                          size="icon"
                          className="absolute top-1 right-1 h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity rounded-full p-0.5 z-10"
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent opening modal when clicking delete
                            removeImage(image.id);
                          }}
                          aria-label={`Remove image ${index + 1}`}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                        {/* Description Snippet */}
                        {image.description && (
                          <p
                            className="mt-1 text-xs text-muted-foreground text-center truncate w-full px-1"
                            title={getFirstLine(image.description)}
                          >
                            {getFirstLine(image.description)}
                          </p>
                        )}
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
              onChange={(value) => handleCategoryChange("timeline", value)}
            />
            <CategoryCard
              title="Budget"
              icon={DollarSign}
              isEditable
              value={categorizedInfo.budget}
              onChange={(value) => handleCategoryChange("budget", value)}
            >
              {/* Additional content for Budget card (Table and Button) passed as children */}
              {lineItems.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-2 text-primary">
                    Line Items:
                  </h4>
                  <LineItemTable lineItems={lineItems} />
                </div>
              )}
              <div>{manageLineItemsButton}</div>
            </CategoryCard>
          </div>
        )}
      </main>

      <footer className="bg-background border-t 0 pt-6 relative mt-8">
        <AudioRecorder
          onRecordingComplete={handleRecordingComplete}
          isProcessing={isLoading || isCategorizing}
        />
      </footer>

      <LineItemModal
        isOpen={isLineItemModalOpen}
        onOpenChange={setIsLineItemModalOpen}
        lineItems={lineItems}
        onAddLineItem={handleAddLineItem}
        // onRemoveLineItem={handleRemoveLineItem} // Pass remove function if implemented
      />

      {selectedImageData && (
        <ImageDetailModal
          isOpen={isImageDetailModalOpen}
          onOpenChange={setIsImageDetailModalOpen}
          image={selectedImageData}
          onSaveDescription={(desc) => {
            if (selectedImageIndex !== null) {
              handleSaveImageDescription(selectedImageIndex, desc);
            }
          }}
        />
      )}
    </div>
  );
}
