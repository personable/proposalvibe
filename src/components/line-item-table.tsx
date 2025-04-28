import React from 'react';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import type { LineItem } from '@/types';

interface LineItemTableProps {
  lineItems: LineItem[];
  // Add props for editing/deleting if needed later
}

const LineItemTable: React.FC<LineItemTableProps> = ({ lineItems }) => {
  const calculateTotal = () => {
    return lineItems
      .reduce((sum, item) => sum + item.quantity * item.price, 0)
      .toFixed(2);
  };

  return (
    <div className="text-sm"> {/* Ensure consistent text size */}
      <div className="max-h-[250px] overflow-y-auto border rounded-md mb-2"> {/* Max height and scroll */}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px] px-2 py-1 h-8">Qty</TableHead><TableHead className="px-2 py-1 h-8">Item Name</TableHead><TableHead className="w-[80px] text-right px-2 py-1 h-8">Price</TableHead><TableHead className="w-[90px] text-right px-2 py-1 h-8">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {lineItems.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="h-16 text-center text-muted-foreground px-2 py-1"> {/* Compact cell */}
                  No line items added yet.
                </TableCell>
              </TableRow>
            )}
            {lineItems.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium px-2 py-1">{item.quantity}</TableCell><TableCell className="px-2 py-1">{item.itemName}</TableCell><TableCell className="text-right px-2 py-1">${item.price.toFixed(2)}</TableCell><TableCell className="text-right font-medium px-2 py-1">${(item.quantity * item.price).toFixed(2)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {lineItems.length > 0 && (
        <div className="text-right font-semibold">
          Total: ${calculateTotal()}
        </div>
      )}
    </div>
  );
};

export default LineItemTable;
