import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2 } from 'lucide-react';
import type { LineItem } from '@/types';

interface LineItemModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  lineItems: LineItem[];
  onAddLineItem: (item: Omit<LineItem, 'id'>) => void;
  // Add onRemoveLineItem if needed later
}

const LineItemModal: React.FC<LineItemModalProps> = ({
  isOpen,
  onOpenChange,
  lineItems,
  onAddLineItem,
}) => {
  const [quantity, setQuantity] = useState<number | string>('');
  const [itemName, setItemName] = useState('');
  const [price, setPrice] = useState<number | string>('');
  const [errors, setErrors] = useState<{ quantity?: string; itemName?: string; price?: string }>({});

  const validateForm = () => {
    const newErrors: { quantity?: string; itemName?: string; price?: string } = {};
    if (!quantity || isNaN(Number(quantity)) || Number(quantity) <= 0) {
      newErrors.quantity = 'Must be a positive number';
    }
    if (!itemName.trim()) {
      newErrors.itemName = 'Item name is required';
    }
    if (!price || isNaN(Number(price)) || Number(price) < 0) {
       newErrors.price = 'Must be a non-negative number';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };


  const handleAddItem = () => {
    if (!validateForm()) {
      return;
    }
    onAddLineItem({
      quantity: Number(quantity),
      itemName: itemName.trim(),
      price: Number(price),
    });
    // Reset form
    setQuantity('');
    setItemName('');
    setPrice('');
    setErrors({});
  };

  const handleNumericInputChange = (
     setter: React.Dispatch<React.SetStateAction<string | number>>,
     value: string
   ) => {
     // Allow empty string or valid numbers (including decimals for price)
     if (value === '' || /^\d*\.?\d*$/.test(value)) {
       setter(value);
     }
   };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>Add Budget Line Items</DialogTitle>
          <DialogDescription>
            Enter the details for each line item for this job's budget.
          </DialogDescription>
        </DialogHeader>

        {/* Form for adding new items */}
        <div className="grid grid-cols-1 sm:grid-cols-[1fr_3fr_1fr_auto] gap-3 items-end py-4">
          <div>
            <Label htmlFor="quantity" className="text-right text-xs">
              Quantity
            </Label>
            <Input
              id="quantity"
              type="number"
              value={quantity}
              onChange={(e) => handleNumericInputChange(setQuantity, e.target.value)}
              placeholder="e.g., 1"
              className={`mt-1 ${errors.quantity ? 'border-destructive' : ''}`}
              min="1"
            />
            {errors.quantity && <p className="text-xs text-destructive mt-1">{errors.quantity}</p>}
          </div>
          <div>
            <Label htmlFor="item-name" className="text-right text-xs">
              Item Name
            </Label>
            <Input
              id="item-name"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              placeholder="e.g., Drywall Sheet 4x8"
              className={`mt-1 ${errors.itemName ? 'border-destructive' : ''}`}
            />
             {errors.itemName && <p className="text-xs text-destructive mt-1">{errors.itemName}</p>}
          </div>
          <div>
            <Label htmlFor="price" className="text-right text-xs">
              Price ($)
            </Label>
            <Input
              id="price"
              type="number"
              value={price}
              onChange={(e) => handleNumericInputChange(setPrice, e.target.value)}
              placeholder="e.g., 15.50"
               className={`mt-1 ${errors.price ? 'border-destructive' : ''}`}
               min="0"
               step="0.01"
            />
             {errors.price && <p className="text-xs text-destructive mt-1">{errors.price}</p>}
          </div>
          <Button onClick={handleAddItem} size="icon" variant="outline" aria-label="Add Item" className="mt-1">
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {/* Table for displaying items */}
         <div className="max-h-[300px] overflow-y-auto border rounded-md">
            <Table>
             <TableHeader>
               <TableRow>
                 <TableHead className="w-[80px]">Quantity</TableHead>
                 <TableHead>Item Name</TableHead>
                 <TableHead className="w-[100px] text-right">Price</TableHead>
                  <TableHead className="w-[50px] text-right">Total</TableHead>
                 {/* Add Actions column if needed later */}
                 {/* <TableHead className="w-[50px]"></TableHead> */}
               </TableRow>
             </TableHeader>
             <TableBody>
               {lineItems.length === 0 && (
                 <TableRow>
                   <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                     No line items added yet.
                   </TableCell>
                 </TableRow>
               )}
               {lineItems.map((item) => (
                 <TableRow key={item.id}>
                   <TableCell className="font-medium">{item.quantity}</TableCell>
                   <TableCell>{item.itemName}</TableCell>
                   <TableCell className="text-right">${item.price.toFixed(2)}</TableCell>
                    <TableCell className="text-right font-medium">${(item.quantity * item.price).toFixed(2)}</TableCell>
                   {/* Add remove button cell if needed */}
                   {/* <TableCell>
                     <Button variant="ghost" size="icon" className="h-8 w-8">
                       <Trash2 className="h-4 w-4 text-destructive" />
                     </Button>
                   </TableCell> */}
                 </TableRow>
               ))}
             </TableBody>
           </Table>
        </div>

         {/* Display Total */}
         {lineItems.length > 0 && (
           <div className="mt-4 text-right font-semibold text-lg">
             Total: $
             {lineItems
               .reduce((sum, item) => sum + item.quantity * item.price, 0)
               .toFixed(2)}
           </div>
         )}


        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              Close
            </Button>
          </DialogClose>
          {/* Optionally add a Save button */}
          {/* <Button type="button">Save Changes</Button> */}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default LineItemModal;
