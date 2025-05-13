'use client';

import React from 'react';
import { useSearchParams } from 'next/navigation';
import DocumentEditor from '@/components/document-editor';

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

    return `
      <h1>Job Details</h1>

      <h2>Contact Information</h2>
      <ul>
        <li><strong>Name:</strong> ${contactInfo.name}</li>
        <li><strong>Address:</strong> ${contactInfo.address}</li>
        <li><strong>Phone:</strong> ${contactInfo.phone}</li>
        <li><strong>Email:</strong> ${contactInfo.email}</li>
      </ul>

      <h2>Scope of Work</h2>
      <p>${scopeOfWork}</p>

      <h2>Timeline</h2>
      <p>${timeline}</p>

      <h2>Budget</h2>
      <p>${budget}</p>
    `;
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <DocumentEditor initialContent={generateInitialContent()} />
    </div>
  );
}