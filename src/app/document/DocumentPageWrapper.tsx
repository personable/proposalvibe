import DocumentPage from './DocumentPage';
import { SearchParams } from 'next/navigation'

interface Props {
  searchParams: SearchParams
}

export default function DocumentPageWrapper({ searchParams }: Props) {
  const scopeOfWork = searchParams.scope || 'Not provided';
  const name = searchParams.name || 'Not provided';
  const address = searchParams.address || 'Not provided';
  const phone = searchParams.phone || 'Not provided';
  const email = searchParams.email || 'Not provided';
  const timeline = searchParams.timeline || 'Not provided';
  const budget = searchParams.budget || 'Not provided';
  const downPayment = searchParams.downPayment || '50';
  const terms = searchParams.terms || 'Standard contractor terms apply.';

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