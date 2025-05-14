import { Suspense } from 'react';
import DocumentPageWrapper from './DocumentPageWrapper';

// Convert to Server Component
export default function DocumentPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DocumentPageWrapper />
    </Suspense>
  );
}