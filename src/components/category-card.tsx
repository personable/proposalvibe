import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea'; // Import Textarea
import type { LucideIcon } from 'lucide-react';

interface CategoryCardProps {
  title: string;
  icon: LucideIcon | React.ElementType;
  content?: React.ReactNode; // For read-only content
  value?: string;           // Value for editable textarea
  isEditable?: boolean;
  onChange?: (newValue: string) => void;
  children?: React.ReactNode; // For additional content below main area (e.g., table/button)
}

const CategoryCard: React.FC<CategoryCardProps> = ({
  title,
  icon: Icon,
  content, // Read-only
  value,   // Editable
  isEditable = false,
  onChange,
  children, // For table/button etc.
}) => {
  return (
    <Card className="shadow-md hover:shadow-lg transition-shadow duration-300 bg-card border border-border flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-semibold text-primary">{title}</CardTitle>
        <Icon className="h-6 w-6 text-accent" />
      </CardHeader>
      <CardContent className="flex-grow flex flex-col justify-between pt-2">
        {/* Main content area: Editable Textarea or Read-only content */}
        <div className="text-sm text-foreground prose prose-sm max-w-none flex-grow mb-4"> {/* Added mb-4 */}
          {isEditable ? (
            <Textarea
              value={value ?? ''} // Use value prop
              onChange={(e) => onChange?.(e.target.value)} // Call onChange prop
              placeholder={`Enter ${title}...`}
              className="min-h-[80px] text-sm" // Ensure consistent text size
              style={{ whiteSpace: 'pre-wrap' }} // Maintain line breaks on edit
            />
          ) : (
            // Render read-only content directly
             content ?? <span className="italic text-muted-foreground">No information provided.</span>
          )}
        </div>

        {/* Render additional children (like table/button) below the main content */}
        {children && <div className="mt-auto border-t pt-4">{children}</div>}
      </CardContent>
    </Card>
  );
};

export default CategoryCard;
