import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2 } from "lucide-react"; // Keep Trash2 for potential future use
import LineItemTable from "./line-item-table"; // Import the reusable table
import type { LineItem } from "@/types";

interface LineItemModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  lineItems: LineItem[];
  onAddLineItem: (item: Omit<LineItem, "id">) => void;
  onRemoveLineItem?: (id: number) => void; // Make remove optional
}

const LineItemModal: React.FC<LineItemModalProps> = ({
  isOpen,
  onOpenChange,
  lineItems,
  onAddLineItem,
  onRemoveLineItem, // Receive remove function
}) => {
  const [quantity, setQuantity] = useState<number | string>("");
  const [itemName, setItemName] = useState("");
  const [price, setPrice] = useState<number | string>("");
  const [errors, setErrors] = useState<{
    quantity?: string;
    itemName?: string;
    price?: string;
  }>({});

  const validateForm = () => {
    const newErrors: { quantity?: string; itemName?: string; price?: string } =
      {};
    if (!quantity || isNaN(Number(quantity)) || Number(quantity) <= 0) {
      newErrors.quantity = "Must be a positive number";
    }
    if (!itemName.trim()) {
      newErrors.itemName = "Item name is required";
    }
    if (!price || isNaN(Number(price)) || Number(price) < 0) {
      newErrors.price = "Must be a non-negative number";
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
    setQuantity("");
    setItemName("");
    setPrice("");
    setErrors({});
  };

  const handleNumericInputChange = (
    setter: React.Dispatch<React.SetStateAction<string | number>>,
    value: string
  ) => {
    // Allow empty string or valid numbers (including decimals for price)
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      setter(value);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[625px] bg-white">
        <DialogHeader>
          <DialogTitle>Budget Line Items</DialogTitle> {/* Simplified title */}
          <DialogDescription>
            Add or view line items for this job's budget.
          </DialogDescription>
        </DialogHeader>

        {/* Form for adding new items */}
        <div className="grid grid-cols-1 sm:grid-cols-[1fr_3fr_1fr_auto] gap-3 items-end py-4 border-b">
          <div>
            <Label htmlFor="quantity" className="text-right text-xs">
              Quantity
            </Label>
            <Input
              id="quantity"
              type="number"
              value={quantity}
              onChange={(e) =>
                handleNumericInputChange(setQuantity, e.target.value)
              }
              placeholder="e.g., 1"
              className={`mt-1 h-9 ${
                errors.quantity ? "border-destructive" : ""
              }`} // Reduced height
              min="1"
            />
            {errors.quantity && (
              <p className="text-xs text-destructive mt-1">{errors.quantity}</p>
            )}
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
              className={`mt-1 h-9 ${
                errors.itemName ? "border-destructive" : ""
              }`} // Reduced height
            />
            {errors.itemName && (
              <p className="text-xs text-destructive mt-1">{errors.itemName}</p>
            )}
          </div>
          <div>
            <Label htmlFor="price" className="text-right text-xs">
              Price ($)
            </Label>
            <Input
              id="price"
              type="number"
              value={price}
              onChange={(e) =>
                handleNumericInputChange(setPrice, e.target.value)
              }
              placeholder="e.g., 15.50"
              className={`mt-1 h-9 ${errors.price ? "border-destructive" : ""}`} // Reduced height
              min="0"
              step="0.01"
            />
            {errors.price && (
              <p className="text-xs text-destructive mt-1">{errors.price}</p>
            )}
          </div>
          <Button
            onClick={handleAddItem}
            size="icon"
            variant="outline"
            aria-label="Add Item"
            className="h-9 w-9 mt-1"
          >
            {" "}
            {/* Reduced size */}
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {/* Displaying items using the reusable component */}
        <div className="py-4">
          <LineItemTable lineItems={lineItems} />
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button type="button">Done</Button>
          </DialogClose>
          {/* Optionally add a Save button if modal modifies existing items directly */}
          {/* <Button type="button">Save Changes</Button> */}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default LineItemModal;
