export function getLatencyColor(latency: number): string {
  if (latency < 50) return '#10B981'; // Green
  if (latency < 100) return '#3B82F6'; // Blue
  if (latency < 200) return '#F59E0B'; // Yellow
  if (latency < 300) return '#F97316'; // Orange
  return '#EF4444'; // Red
}
