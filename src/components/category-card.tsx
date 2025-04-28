import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import type { LucideIcon } from 'lucide-react';

interface CategoryCardProps {
  title: string;
  icon: LucideIcon | React.ElementType; // Allow both Lucide icons and custom SVGs
  content: string | React.ReactNode;
  actionButton?: React.ReactNode; // Optional action button
}

const CategoryCard: React.FC<CategoryCardProps> = ({ title, icon: Icon, content, actionButton }) => {
  return (
    <Card className="shadow-md hover:shadow-lg transition-shadow duration-300 bg-card border border-border flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-semibold text-primary">{title}</CardTitle>
        <Icon className="h-6 w-6 text-accent" />
      </CardHeader>
      <CardContent className="flex-grow flex flex-col justify-between">
        <div className="text-sm text-foreground prose prose-sm max-w-none">
          {typeof content === 'string' ? (
            // Use whitespace-pre-wrap to preserve newlines from AI output
            <p style={{ whiteSpace: 'pre-wrap' }}>
              {content || <span className="italic text-muted-foreground">No information provided.</span>}
            </p>
          ) : (
            content
          )}
        </div>
        {actionButton && <div className="mt-auto pt-4">{actionButton}</div>}
      </CardContent>
    </Card>
  );
};

export default CategoryCard;
