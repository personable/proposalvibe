'use client';

import { useSearchParams } from 'next/navigation';
import DocumentPage from './DocumentPage';

export default function DocumentPageWrapper() {
  const searchParams = useSearchParams();

  const scopeOfWork = searchParams.get('scope') || 'Not provided';
  const name = searchParams.get('name') || 'Not provided';
  const address = searchParams.get('address') || 'Not provided';
  const phone = searchParams.get('phone') || 'Not provided';
  const email = searchParams.get('email') || 'Not provided';
  const timeline = searchParams.get('timeline') || 'Not provided';
  const budget = searchParams.get('budget') || 'Not provided';
  const downPayment = searchParams.get('downPayment') || '50';
  const terms = searchParams.get('terms') || 'Standard contractor terms apply.';

  const contactInfo = {
    name,
    address,
    phone,
    email
  };

  return (
    <DocumentPage
      scopeOfWork={scopeOfWork}
      contactInfo={contactInfo}
      timeline={timeline}
      budget={budget}
      downPayment={downPayment}
      terms={terms}
    />
  );
}