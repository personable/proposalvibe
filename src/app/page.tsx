'use client';

import React, { useState, useCallback, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { categorizeInformationAction, transcribeAudioAction } from "./actions";
import AudioRecorder from "@/components/audio-recorder";
import CategoryCard from "@/components/category-card";
import LineItemModal from "@/components/line-item-modal";
import ImageDetailModal from "@/components/image-detail-modal";
import LineItemTable from "@/components/line-item-table";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  ClipboardList,
  Check,
  User,
  CalendarClock,
  DollarSign,
  PlusCircle,
  Pencil,
  RotateCcw,
  Upload,
  X,
  ChevronLeft,
  ChevronRight,
  FileText,
  Percent,
} from "lucide-react";
import type { CategorizeInformationOutput } from "@/ai/flows/categorize-information";
import { useToast } from "@/hooks/use-toast";
import type { LineItem, ImageDetail } from "@/types";
import { cn } from "@/lib/utils";

const MAX_IMAGES = 5;

const EXAMPLE_CARDS = [
  {
    title: "Contact Info",
    content: "We're doing this work for Jane Stevens at 12 Main Street in Portland, Maine, 04103. Her email is j-stevens1986 at hotmail. Her number is 555-555-5555.",
    icon: "🏠"
  },
  {
    title: "Scope of Work",
    content: "We're installing 10 Richards Windows to code. Removing old window weights and stuffing the cavities. We're going to wrap exterior casings with custom-fit aluminum. Clean-up and disposal of old windows.",
    icon: "🔨"
  },
  {
    title: "Timeline",
    content: "This work should take about three days. If the weather is bad, we'll have to pause, and it'll take longer.",
    icon: "📅"
  },
  {
    title: "Budget & Payment",
    content: "Total cost is going to be around five-thousand, and we're going to need twenty-five hundred down to start the work.",
    icon: "💰"
  }
];

export default function Home() {
  const router = useRouter();
  const [transcribedText, setTranscribedText] = useState<string | null>(null);
  const [categorizedInfo, setCategorizedInfo] = useState<CategorizeInformationOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCategorizing, setIsCategorizing] = useState(false);
  const [isLineItemModalOpen, setIsLineItemModalOpen] = useState(false);
  const [isImageDetailModalOpen, setIsImageDetailModalOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [scopeImages, setScopeImages] = useState<ImageDetail[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [downPaymentPercentage, setDownPaymentPercentage] = useState<string>("");
  const [termsAndConditions, setTermsAndConditions] = useState<string>("");

  const [contactName, setContactName] = useState("");
  const [contactAddress, setContactAddress] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactEmail, setContactEmail] = useState("");

  const { toast } = useToast();

  useEffect(() => {
    if (categorizedInfo?.contactInformation) {
      setContactName(categorizedInfo.contactInformation.name || "");
      setContactAddress(categorizedInfo.contactInformation.address || "");
      setContactPhone(categorizedInfo.contactInformation.phone || "");
      setContactEmail(categorizedInfo.contactInformation.email || "");
    }
  }, [categorizedInfo]);

  const handleCreateDocument = () => {
    if (!categorizedInfo) return;
    
    const params = new URLSearchParams({
      scope: categorizedInfo.scopeOfWork,
      name: categorizedInfo.contactInformation.name,
      address: categorizedInfo.contactInformation.address,
      phone: categorizedInfo.contactInformation.phone,
      email: categorizedInfo.contactInformation.email,
      timeline: categorizedInfo.timeline,
      budget: categorizedInfo.budget,
      downPayment: downPaymentPercentage,
      terms: termsAndConditions
    });

    // Navigate in the same window
    router.push(`/document?${params.toString()}`);
  };

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
    setTranscribedText(null);
    setCategorizedInfo(null);
    setLineItems([]);
    setScopeImages([]);
    setIsLineItemModalOpen(false);
    setIsImageDetailModalOpen(false);
    setSelectedImageIndex(null);
    setContactName("");
    setContactAddress("");
    setContactPhone("");
    setContactEmail("");
    setDownPaymentPercentage("");
    setTermsAndConditions("");

    try {
      const transcriptionResult = await transcribeAudioAction({ audioDataUri });
      if (transcriptionResult && transcriptionResult.transcription) {
        setTranscribedText(transcriptionResult.transcription);
        setIsLoading(false);
        setIsCategorizing(true);

        const categorizationResult = await categorizeInformationAction({
          transcribedText: transcriptionResult.transcription,
        });
        setCategorizedInfo(categorizationResult);
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

  const handleNextCard = () => {
    if (currentCardIndex < EXAMPLE_CARDS.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
    }
  };

  const handlePrevCard = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(currentCardIndex - 1);
    }
  };

  const handleDownPaymentChange = (value: string) => {
    // Only allow numbers and limit to 100
    const numValue = value.replace(/[^\d]/g, '');
    if (numValue === '' || (parseInt(numValue) >= 0 && parseInt(numValue) <= 100)) {
      setDownPaymentPercentage(numValue);
    }
  };

  const renderSkeleton = () => (
    <div className="animate-pulse">
      LOADING SHIT!!!
    </div>
  );

  const handleAddLineItem = (newItem: Omit<LineItem, "id">) => {
    setLineItems((prevItems) => [...prevItems, { ...newItem, id: Date.now() }]);
  };

  const handleCategoryChange = useCallback(
    (category: keyof CategorizeInformationOutput, value: string) => {
      setCategorizedInfo((prev) => {
        if (!prev) return null;
        if (category === "contactInformation") return prev;
        return { ...prev, [category]: value };
      });
    },
    []
  );

  const handleContactChange = useCallback(
    (
      field: keyof CategorizeInformationOutput["contactInformation"],
      value: string
    ) => {
      if (field === "name") setContactName(value);
      else if (field === "address") setContactAddress(value);
      else if (field === "phone") setContactPhone(value);
      else if (field === "email") setContactEmail(value);

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
            id: Date.now() + Math.random(),
            src: reader.result as string,
            description: "",
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

    event.target.value = "";
  };

  const removeImage = (idToRemove: number) => {
    setScopeImages((prev) => prev.filter((image) => image.id !== idToRemove));
  };

  const openImageModal = (index: number) => {
    setSelectedImageIndex(index);
    setIsImageDetailModalOpen(true);
  };

  const handleSaveImageDescription = (
    index: number,
    newDescription: string
  ) => {
    setScopeImages((prev) =>
      prev.map((img, i) =>
        i === index ? { ...img, description: newDescription } : img
      )
    );
    setIsImageDetailModalOpen(false);
    setSelectedImageIndex(null);
  };

  const getFirstLine = (text: string): string => {
    if (!text) return "";
    return text.split("\n")[0];
  };

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
    <div className="mx-auto py-8" style={{ display: "grid", gridTemplateRows: "1fr auto", minHeight: "100%" }}>
      <main style={{ overflowY: "auto" }}>
        {!isLoading && !isCategorizing && !transcribedText && !categorizedInfo && (
          <>
            <h1 className="text-2xl mb-10 text-center font-bold">
              Tap the 🎙️ and talk about the topics on each of the cards &hellip;
            </h1>

            <div className="relative w-full overflow-hidden px-4">
              <div className="relative flex justify-center items-center">
                <button
                  onClick={handlePrevCard}
                  className={cn(
                    "absolute left-0 z-10 p-2 bg-white/80 rounded-full shadow-lg",
                    currentCardIndex === 0 && "opacity-50 cursor-not-allowed"
                  )}
                  disabled={currentCardIndex === 0}
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                
                <div className="w-[320px] relative">
                  {EXAMPLE_CARDS.map((card, index) => (
                    <div
                      key={index}
                      className={cn(
                        "absolute top-0 w-full transition-all duration-300 transform",
                        index === currentCardIndex
                          ? "relative z-20 opacity-100 translate-x-0"
                          : index === currentCardIndex + 1
                          ? "opacity-50 translate-x-[90%]"
                          : "opacity-0 pointer-events-none translate-x-full"
                      )}
                    >
                      <Card className="h-[300px] bg-white shadow-lg">
                        <CardHeader>
                          <div className="flex items-center gap-2">
                            <span className="text-2xl">{card.icon}</span>
                            <CardTitle>{card.title}</CardTitle>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-muted-foreground text-m leading-relaxed">
                            Example: &#8220;{card.content}&#8221;
                          </p>
                        </CardContent>
                      </Card>
                    </div>
                  ))}
                </div>

                <button
                  onClick={handleNextCard}
                  className={cn(
                    "absolute right-0 z-10 p-2 bg-white/80 rounded-full shadow-lg",
                    currentCardIndex === EXAMPLE_CARDS.length - 1 && "opacity-50 cursor-not-allowed"
                  )}
                  disabled={currentCardIndex === EXAMPLE_CARDS.length - 1}
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              </div>

              <div className="flex justify-center gap-1 mt-4">
                {EXAMPLE_CARDS.map((_, index) => (
                  <div
                    key={index}
                    className={cn(
                      "w-2 h-2 rounded-full transition-colors",
                      index === currentCardIndex
                        ? "bg-foreground"
                        : "bg-muted"
                    )}
                  />
                ))}
              </div>
            </div>
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

        {!isLoading && !isCategorizing && categorizedInfo && (
          <div className="space-y-6 mx-auto max-w-[500px] px-4">
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
                    onChange={(e) => handleContactChange("name", e.target.value)}
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
                    value={contactAddress === "Not mentioned" ? "" : contactAddress}
                    onChange={(e) => handleContactChange("address", e.target.value)}
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
                    onChange={(e) => handleContactChange("phone", e.target.value)}
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
                    onChange={(e) => handleContactChange("email", e.target.value)}
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
              <div>
                <Label
                  htmlFor="scope-image-input"
                  className={cn(
                    "inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-3 cursor-pointer",
                    scopeImages.length >= MAX_IMAGES && "opacity-50 cursor-not-allowed"
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
                  className="sr-only"
                  disabled={scopeImages.length >= MAX_IMAGES}
                />
                {scopeImages.length > 0 && (
                  <div className="mt-4 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
                    {scopeImages.map((image, index) => (
                      <div
                        key={image.id}
                        className="relative group/menu-item flex flex-col items-center"
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
                        <Button
                          variant="destructive"
                          size="icon"
                          className="absolute top-1 right-1 h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity rounded-full p-0.5 z-10"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeImage(image.id);
                          }}
                          aria-label={`Remove image ${index + 1}`}
                        >
                          <X className="h-3 w-3" />
                        </Button>
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
            <CategoryCard title="Budget" icon={DollarSign}>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold">Budget</h2>
                  <span className="text-2xl">$</span>
                </div>
                
                <Textarea
                  value={categorizedInfo.budget === "Not mentioned" ? "" : categorizedInfo.budget}
                  onChange={(e) => handleCategoryChange("budget", e.target.value)}
                  placeholder="Enter budget details..."
                  className="min-h-[100px] text-sm bg-white"
                />

                {lineItems.length > 0 && (
                  <div className="bg-white p-4 rounded-lg border">
                    <LineItemTable lineItems={lineItems} />
                  </div>
                )}

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsLineItemModalOpen(true)}
                  className="w-full"
                >
                  {lineItems.length > 0 ? (
                    <Pencil className="mr-2 h-4 w-4" />
                  ) : (
                    <PlusCircle className="mr-2 h-4 w-4" />
                  )}
                  {lineItems.length > 0 ? "View/Edit Line Items" : "Add Line Items"}
                </Button>

                <div className="pt-4 border-t">
                  <Label htmlFor="down-payment" className="text-sm font-medium flex items-center gap-2">
                    <Percent className="h-4 w-4" />
                    Down Payment Percentage
                  </Label>
                  <div className="mt-2 relative">
                    <Input
                      id="down-payment"
                      type="number"
                      min="0"
                      max="100"
                      value={downPaymentPercentage}
                      onChange={(e) => handleDownPaymentChange(e.target.value)}
                      placeholder="Enter down payment percentage..."
                      className="pr-8"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      %
                    </span>
                  </div>
                </div>
              </div>
            </CategoryCard>

            <CategoryCard title="Terms & Conditions" icon={FileText}>
              <div className="space-y-2">
                <Label htmlFor="terms" className="text-sm font-medium">
                  Additional Terms & Conditions
                </Label>
                <Textarea
                  id="terms"
                  value={termsAndConditions}
                  onChange={(e) => setTermsAndConditions(e.target.value)}
                  placeholder="Enter any additional terms and conditions..."
                  className="min-h-[150px]"
                />
              </div>
            </CategoryCard>
          </div>
        )}
      </main>

      <footer className="bg-background border-t 0 pt-6 relative mt-8 flex justify-center gap-4">
        {!isLoading && !isCategorizing && categorizedInfo ? (
          <>
            <button
              className="w-24 h-24 rounded-full shadow-lg grid place-items-center"
              id="reload"
              onClick={() => window.location.reload()}
            >
              <RotateCcw className="h-10 w-10" />
            </button>
            <button
              id="create"
              className="w-24 h-24 rounded-full shadow-lg grid place-items-center bg-green-700 text-accent-foreground"
              onClick={handleCreateDocument}
            >
              <Check className="h-10 w-10" />
            </button>
          </>
        ) : (
          <AudioRecorder
            onRecordingComplete={handleRecordingComplete}
            isProcessing={isLoading || isCategorizing}
          />
        )}
      </footer>

      <LineItemModal
        isOpen={isLineItemModalOpen}
        onOpenChange={setIsLineItemModalOpen}
        lineItems={lineItems}
        onAddLineItem={handleAddLineItem}
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