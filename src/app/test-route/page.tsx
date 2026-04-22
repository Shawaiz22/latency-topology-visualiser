'use client';

import { useSearchParams } from 'next/navigation';

export default function TokenTest() {
    const searchParams = useSearchParams();
    const url = searchParams.get('url');

    if (!url) {
        return <div className='p-4'>URL not provided in query</div>;
    }

    return (
        <div className='h-[calc(100vh-60px)] w-full'>
            <iframe src={decodeURIComponent(url)} className='h-full w-full' />
        </div>
    );
}
