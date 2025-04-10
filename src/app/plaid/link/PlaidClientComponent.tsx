'use client'

import {
    usePlaidLink,
    PlaidLinkOptions,
    PlaidLinkOnSuccess,
    PlaidLinkOnSuccessMetadata,
} from 'react-plaid-link';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';


export default function PlaidClientComponent() {
    // grab link token from url
    const searchParams = useSearchParams();
    const linkToken = searchParams.get('link_token');
    const [title, setTitle] = useState('getting you to plaid...');

    console.log('link token', linkToken);
    if (!linkToken) {
        return <div>Missing link token. Please try again.</div>;
    }
    const onSuccess = useCallback<PlaidLinkOnSuccess> (
        async(public_token: string, metadata: PlaidLinkOnSuccessMetadata) => {
            try {
                const res = await fetch('/api/exchange-public-token', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ public_token }),
                });
          
                if (!res.ok) throw new Error('Token exchange failed');
          
                const data = await res.json();
                setTitle('Setting up a few things...');
                console.log('Success:', data);   

                const res_connect_new_institution = await fetch('/api/connect-new-institution', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        item_id: data.item_id,
                        plaid_access_token: data.access_token,
                    }),
                });
                if (res_connect_new_institution.status !== 201) throw new Error('New institution connection failed');

                const res_add_institution_accounts = await fetch('/api/add-institution-accounts', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        item_id: data.item_id
                    }),
                });
                if (res_add_institution_accounts.status !== 201) throw new Error('New institution connection failed');

                setTitle('All done! You can close this window now.');
            } catch (err) {
                console.error('Plaid onSuccess error:', err);
            }
        },
        []
    );

    const config: PlaidLinkOptions = {
        onSuccess: onSuccess,
        onExit: (err, metadata) => {},
        onEvent: (eventName, metadata) => { console.log('event', eventName, metadata); },
        token: linkToken ?? ' ',
    };
  
  const { open, exit, ready } = usePlaidLink(config);

    useEffect(() => {
        if (ready && linkToken) {
          open();
        }
    }, [ready, linkToken]);

    return (
        <div className='flex flex-col items-center justify-center min-h-screen p-24'>
            <h1 className='text-2xl font-bold md:font-merriweather'>{title}</h1>
        </div>
    );
}

