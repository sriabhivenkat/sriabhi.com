import { Suspense } from 'react';
import PlaidClientComponent from './PlaidClientComponent';

export default function Page() {
  return (
    <Suspense fallback={<div>Loading Plaid...</div>}>
      <PlaidClientComponent />
    </Suspense>
  );
}