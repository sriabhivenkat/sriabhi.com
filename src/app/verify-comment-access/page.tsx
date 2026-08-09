import { Suspense } from 'react';
import VerifyCommentAccessPage from './VerifyCommentClientComponent';

export default function Page() {
  return (
    <Suspense fallback={<div>Loading Plaid...</div>}>
      <VerifyCommentAccessPage />
    </Suspense>
  );
}