import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea"; // Import Textarea
import type { LucideIcon } from "lucide-react";

interface CategoryCardProps {
  title: string;
  icon: LucideIcon | React.ElementType;
  content?: React.ReactNode; // For read-only content OR custom layout when not editable
  value?: string; // Value for editable textarea
  isEditable?: boolean;
  onChange?: (newValue: string) => void;
  children?: React.ReactNode; // For additional content below main area (e.g., table/button) OR primary content if not editable
}

const CategoryCard: React.FC<CategoryCardProps> = ({
  title,
  icon: Icon,
  content, // Can be used for read-only or custom layout (like inputs)
  value, // Editable textarea value
  isEditable = false,
  onChange,
  children, // Can be used for table/button OR primary content if not editable
}) => {
  // Determine what to render in the main content area
  const mainContent = isEditable ? (
    <Textarea
      value={value ?? ""}
      onChange={(e) => onChange?.(e.target.value)}
      placeholder={`Enter ${title}...`}
      className="min-h-[180px] text-sm"
      style={{ whiteSpace: "pre-wrap" }}
    />
  ) : (
    // If not editable, prioritize children, then content prop, then default text
    children ??
    content ?? (
      <span className="italic text-muted-foreground">
        No information provided.
      </span>
    )
  );

  // Determine what to render below the main content (e.g., table/button)
  // This is only used if `children` wasn't used as the main content
  const additionalContent = !isEditable && children ? null : children; // Original children prop intent for addons

  return (
    <Card className="duration-300 bg-card border border-border flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-semibold text-primary">
          {title}
        </CardTitle>
        <Icon className="h-6 w-6" />
      </CardHeader>
      <CardContent className="flex-grow flex flex-col justify-between pt-2">
        {/* Main content area: Editable Textarea or Custom Layout */}
        <div className="text-sm text-foreground prose prose-sm max-w-none flex-grow mb-4">
          {mainContent}
        </div>

        {/* Render additional content (like table/button) below the main area only if it exists */}
        {/* If isEditable, children is always additional content */}
        {/* If !isEditable, children might have been used for mainContent, so check the original `children` prop */}
        {children && (isEditable || content) && (
          <div className="mt-auto">{children}</div>
        )}
      </CardContent>
    </Card>
  );
};

export default CategoryCard;
