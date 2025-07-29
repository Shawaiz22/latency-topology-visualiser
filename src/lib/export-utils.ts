import { ExchangeServer } from '@/data/exchanges';

export type ExportFormat = 'json' | 'csv' | 'png';

export function exportData(servers: ExchangeServer[], format: ExportFormat, selectedId: string | null = null) {
  switch (format) {
    case 'json':
      exportToJson(servers, selectedId);
      break;
    case 'csv':
      exportToCsv(servers, selectedId);
      break;
    case 'png':
      exportToPng();
      break;
    default:
      console.warn(`Unsupported export format: ${format}`);
  }
}

function exportToJson(servers: ExchangeServer[], selectedId: string | null) {
  const data = selectedId 
    ? servers.find(s => s.id === selectedId)
    : servers;
  
  const dataStr = JSON.stringify(data, null, 2);
  const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
  
  const exportName = selectedId 
    ? `server-${selectedId}-${new Date().toISOString().slice(0, 10)}.json`
    : `servers-${new Date().toISOString().slice(0, 10)}.json`;
  
  triggerDownload(dataUri, exportName);
}

function exportToCsv(servers: ExchangeServer[], selectedId: string | null) {
  const data = selectedId 
    ? servers.filter(s => s.id === selectedId)
    : servers;
  
  // Convert to CSV
  const headers = [
    'id',
    'name',
    'provider',
    'region',
    'country',
    'city',
    'lat',
    'lon',
    'status',
    'currentLatency',
    'lastUpdated'
  ];
  
  const csvRows = [];
  csvRows.push(headers.join(','));
  
  for (const server of data) {
    const values = headers.map(header => {
      const value = server[header as keyof ExchangeServer];
      const escaped = ('' + value).replace(/"/g, '\\"');
      return `"${escaped}"`;
    });
    csvRows.push(values.join(','));
  }
  
  const csvContent = csvRows.join('\n');
  const dataUri = `data:text/csv;charset=utf-8,${encodeURIComponent(csvContent)}`;
  
  const exportName = selectedId 
    ? `server-${selectedId}-${new Date().toISOString().slice(0, 10)}.csv`
    : `servers-${new Date().toISOString().slice(0, 10)}.csv`;
  
  triggerDownload(dataUri, exportName);
}

async function exportToPng() {
  try {
    // Use html2canvas to capture the canvas
    const html2canvas = (await import('html2canvas')).default;
    const canvas = document.querySelector('canvas');
    
    if (!canvas) {
      console.error('Canvas element not found');
      return;
    }
    
    // Create a temporary canvas with white background for better visibility
    const tempCanvas = document.createElement('canvas');
    const ctx = tempCanvas.getContext('2d');
    
    if (!ctx) {
      console.error('Could not get 2D context');
      return;
    }
    
    // Set canvas size
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    
    // Fill with white background
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
    
    // Draw the original canvas on top
    ctx.drawImage(canvas, 0, 0);
    
    // Convert to data URL and download
    const dataUrl = tempCanvas.toDataURL('image/png');
    const exportName = `latency-visualization-${new Date().toISOString().slice(0, 10)}.png`;
    
    triggerDownload(dataUrl, exportName);
  } catch (error) {
    console.error('Error exporting to PNG:', error);
  }
}

function triggerDownload(uri: string, name: string) {
  const link = document.createElement('a');
  link.download = name;
  link.href = uri;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
