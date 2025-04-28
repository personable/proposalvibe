/**
 * @fileOverview Defines shared TypeScript types used across the application.
 */

export interface LineItem {
  id: number; // Simple ID for React keys, consider using UUID in a real app
  quantity: number;
  itemName: string;
  price: number;
}

export interface ContactInformation {
    name: string;
    address: string;
    phone: string;
    email: string;
}

export interface ImageDetail {
  id: number; // Simple ID for React keys
  src: string; // Data URI of the image
  description: string; // User-added description
}
