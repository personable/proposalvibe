import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import type { LucideIcon } from 'lucide-react';

interface CategoryCardProps {
  title: string;
  icon: LucideIcon | React.ElementType; // Allow both Lucide icons and custom SVGs
  content: string | React.ReactNode;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ title, icon: Icon, content }) => {
  return (
    <Card className="shadow-md hover:shadow-lg transition-shadow duration-300 bg-card border border-border">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-semibold text-primary">{title}</CardTitle>
        <Icon className="h-6 w-6 text-accent" />
      </CardHeader>
      <CardContent>
        <div className="text-sm text-foreground prose prose-sm max-w-none">
          {typeof content === 'string' ? (
            <p>{content || <span className="italic text-muted-foreground">No information provided.</span>}</p>
          ) : (
            content
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default CategoryCard;
