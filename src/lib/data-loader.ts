import type { ReportData } from '@/types/report-data';

// This function is no longer used for the primary data loading mechanism,
// as data is now handled on the client-side via localStorage.
// It is kept here for potential future use or alternative data loading strategies.
export async function loadReportData(): Promise<ReportData | null> {
  // We return null because the primary source of truth is now localStorage.
  // The main page component will handle fetching from localStorage.
  return null;
}
