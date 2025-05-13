'use client';

import React from 'react';
import { useSearchParams } from 'next/navigation';
import DocumentEditor from '@/components/document-editor';
import { format } from 'date-fns';

export default function DocumentPage() {
  const searchParams = useSearchParams();
  
  const generateInitialContent = () => {
    const scopeOfWork = searchParams.get('scope') || 'Not provided';
    const contactInfo = {
      name: searchParams.get('name') || 'Not provided',
      address: searchParams.get('address') || 'Not provided',
      phone: searchParams.get('phone') || 'Not provided',
      email: searchParams.get('email') || 'Not provided'
    };
    const timeline = searchParams.get('timeline') || 'Not provided';
    const budget = searchParams.get('budget') || 'Not provided';
    const currentDate = format(new Date(), 'MMMM d, yyyy');

    return `
      <div class="text-center mb-12">
        <h1 class="text-3xl font-bold mb-4">Construction Project Proposal</h1>
        <p class="text-muted-foreground">${currentDate}</p>
      </div>

      <div class="mb-8">
        <h2 class="text-xl font-semibold mb-4">Client Information</h2>
        <div class="pl-4 border-l-2 border-accent">
          <p><strong>Name:</strong> ${contactInfo.name}</p>
          <p><strong>Address:</strong> ${contactInfo.address}</p>
          <p><strong>Phone:</strong> ${contactInfo.phone}</p>
          <p><strong>Email:</strong> ${contactInfo.email}</p>
        </div>
      </div>

      <div class="mb-8">
        <h2 class="text-xl font-semibold mb-4">Project Overview</h2>
        <div class="bg-muted/30 p-4 rounded-lg">
          <p>${scopeOfWork}</p>
        </div>
      </div>

      <div class="mb-8">
        <h2 class="text-xl font-semibold mb-4">Project Timeline</h2>
        <div class="border rounded-lg p-4">
          <p>${timeline}</p>
        </div>
      </div>

      <div class="mb-12">
        <h2 class="text-xl font-semibold mb-4">Investment</h2>
        <div class="bg-muted/30 p-4 rounded-lg">
          <p>${budget}</p>
        </div>
      </div>

      <div class="mb-8">
        <h2 class="text-xl font-semibold mb-4">Terms & Conditions</h2>
        <ul class="list-disc pl-5 space-y-2">
          <li>This proposal is valid for 30 days from the date above.</li>
          <li>Payment terms: 50% deposit required to begin work.</li>
          <li>Final payment due upon project completion.</li>
          <li>Any changes to the scope of work may affect the timeline and cost.</li>
        </ul>
      </div>

      <div class="mt-12 pt-8 border-t">
        <div class="mb-8">
          <p class="font-semibold">Acceptance of Proposal:</p>
          <p class="text-muted-foreground">The above prices, specifications, and conditions are satisfactory and hereby accepted. You are authorized to perform the work as specified.</p>
        </div>
        
        <div class="grid grid-cols-2 gap-8">
          <div>
            <p class="font-semibold mb-4">Client Signature:</p>
            <div class="border-b border-dashed w-48"></div>
            <p class="text-sm text-muted-foreground mt-2">Date</p>
          </div>
          <div>
            <p class="font-semibold mb-4">Contractor Signature:</p>
            <div class="border-b border-dashed w-48"></div>
            <p class="text-sm text-muted-foreground mt-2">Date</p>
          </div>
        </div>
      </div>
    `;
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <DocumentEditor initialContent={generateInitialContent()} />
    </div>
  );
}