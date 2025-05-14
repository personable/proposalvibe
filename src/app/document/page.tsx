'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { format } from 'date-fns';

export default function DocumentPage() {
  const searchParams = useSearchParams();
  const [scopeOfWork, setScopeOfWork] = useState('Not provided');
  const [contactInfo, setContactInfo] = useState({
    name: 'Not provided',
    address: 'Not provided',
    phone: 'Not provided',
    email: 'Not provided'
  });
  const [timeline, setTimeline] = useState('Not provided');
  const [budget, setBudget] = useState('Not provided');
  const [downPayment, setDownPayment] = useState('50');
  const [terms, setTerms] = useState('Standard contractor terms apply.');
  const [currentDate] = useState(format(new Date(), 'MM/dd/yyyy'));

  useEffect(() => {
    // Only access searchParams after component mount
    const params = new URLSearchParams(window.location.search);
    
    const scope = params.get('scope');
    const name = params.get('name');
    const address = params.get('address');
    const phone = params.get('phone');
    const email = params.get('email');
    const timelineParam = params.get('timeline');
    const budgetParam = params.get('budget');
    const downPaymentParam = params.get('downPayment');
    const termsParam = params.get('terms');

    if (scope) setScopeOfWork(scope);
    if (name || address || phone || email) {
      setContactInfo({
        name: name || 'Not provided',
        address: address || 'Not provided',
        phone: phone || 'Not provided',
        email: email || 'Not provided'
      });
    }
    if (timelineParam) setTimeline(timelineParam);
    if (budgetParam) setBudget(budgetParam);
    if (downPaymentParam) setDownPayment(downPaymentParam);
    if (termsParam) setTerms(termsParam);
  }, []); // Empty dependency array since we only need to run this once on mount

  // Extract numbers from budget text
  const extractAmounts = (text: string) => {
    const matches = text.match(/\$?([\d,]+(?:\.\d{2})?)/g) || [];
    return matches.map(match => parseFloat(match.replace(/[$,]/g, '')));
  };

  const amounts = extractAmounts(budget);
  const total = amounts.reduce((sum, amount) => sum + amount, 0);
  const downPaymentAmount = (total * (parseInt(downPayment) / 100));

  // Format budget lines for display
  const budgetLines = budget.split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0);

  return (
    <div className="max-w-[8.5in] mx-auto bg-white p-8 shadow-lg">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{contactInfo.name} Project Proposal</h1>
        <p className="text-sm text-gray-600">Date: {currentDate}</p>
      </div>

      <div className="grid grid-cols-2 gap-8 mb-8">
        <div>
          <h3 className="font-semibold mb-2">Customer</h3>
          <div className="text-sm">
            <p>{contactInfo.name}</p>
            <p>{contactInfo.address}</p>
            <p>Phone Number: {contactInfo.phone}</p>
            <p>Email: {contactInfo.email}</p>
          </div>
        </div>
        <div>
          <h3 className="font-semibold mb-2">Company</h3>
          <div className="text-sm">
            <p>Custom Construction Co.</p>
            <p>350 Builder Street, Suite 220</p>
            <p>Construction City, ST 12345</p>
            <p>info@customconstruction.com</p>
          </div>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Overview</h2>
        <p className="text-sm whitespace-pre-wrap">{scopeOfWork}</p>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Scope of Work</h2>
        <div className="text-sm">
          {scopeOfWork.split('\n').map((line, index) => (
            <p key={index} className="mb-2 flex items-start">
              <span className="mr-2">•</span>
              <span>{line}</span>
            </p>
          ))}
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Timeline</h2>
        <div className="text-sm whitespace-pre-wrap">{timeline}</div>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Price Breakdown</h2>
        <p className="text-sm mb-4 text-gray-600">Line items and amounts are all generated. Audit and adjust totals before sharing.</p>
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left font-medium">Description</th>
                <th className="px-4 py-2 text-right font-medium">Amount</th>
              </tr>
            </thead>
            <tbody>
              {budgetLines.map((line, i) => {
                const amount = amounts[i] || 0;
                return (
                  <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-4 py-2">{line}</td>
                    <td className="px-4 py-2 text-right">${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="bg-gray-50 font-medium">
              <tr>
                <td className="px-4 py-2 text-right">Total:</td>
                <td className="px-4 py-2 text-right">${total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Payment</h2>
        <p className="text-sm">
          To start work, we will need a {downPayment}% deposit (${downPaymentAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}).
          The remainder (${(total - downPaymentAmount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}) will be paid when the work has been completed to your satisfaction.
        </p>
      </div>

      <div className="mb-12">
        <h2 className="text-xl font-semibold mb-4">Terms & Conditions</h2>
        <div className="text-sm whitespace-pre-wrap">{terms}</div>
      </div>

      <div className="grid grid-cols-2 gap-8 mt-12 pt-8 border-t">
        <div>
          <p className="font-medium mb-8">Client Signature:</p>
          <div className="border-b border-dashed w-48"></div>
          <p className="text-sm text-gray-600 mt-2">Date</p>
        </div>
        <div>
          <p className="font-medium mb-8">Contractor Signature:</p>
          <div className="border-b border-dashed w-48"></div>
          <p className="text-sm text-gray-600 mt-2">Date</p>
        </div>
      </div>
    </div>
  );
}