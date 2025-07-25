'use client';
import { EXCHANGE_SERVERS } from '@/data/exchanges';
import Marker from './marker';

export default function ServerMarkers() {
    return (
        <>
            {EXCHANGE_SERVERS.map((srv, idx) => (
                <Marker key={idx} server={srv} />
            ))}
        </>
    );
}
