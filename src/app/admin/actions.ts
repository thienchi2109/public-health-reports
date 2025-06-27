'use server';

import { extractDataFromPdf } from '@/ai/flows/extract-data-from-pdf';
import type { ReportData } from '@/types/report-data';
import { promises as fs } from 'fs';
import path from 'path';

// Define the path to the JSON file
const dataFilePath = path.join(process.cwd(), 'src', 'data', 'reportData.json');

// Helper function to read the existing data from the JSON file
async function readReportData(): Promise<Record<string, ReportData>> {
  try {
    const fileContent = await fs.readFile(dataFilePath, 'utf-8');
    if (!fileContent) return {};
    return JSON.parse(fileContent);
  } catch (error) {
    // If the file doesn't exist, return an empty object
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
      return {};
    }
    console.error('Error reading report data file:', error);
    throw new Error('Could not read report data file.');
  }
}

// Helper function to write data to the JSON file
async function writeReportData(data: Record<string, ReportData>): Promise<void> {
  try {
    await fs.writeFile(dataFilePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error writing to report data file:', error);
    throw new Error('Could not write to report data file.');
  }
}

// Helper function to convert a File object to a base64 data URI
async function fileToDataUri(file: File): Promise<string> {
    const buffer = await file.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');
    return `data:${file.type};base64,${base64}`;
}

/**
 * Server action to upload a single PDF report, process it with Gemini,
 * and save the extracted data to a persistent JSON file.
 * @param formData The form data containing the uploaded file and the selected month.
 * @returns An object indicating success or failure with a message.
 */
export async function uploadReport(formData: FormData): Promise<{ success: boolean; message: string }> {
  const file = formData.get('pdf-file') as File | null;
  const month = formData.get('month') as string | null;

  if (!file) {
    return { success: false, message: 'Không có tệp nào được tải lên.' };
  }
  
  if (!month) {
    return { success: false, message: 'Vui lòng chọn tháng cho báo cáo.' };
  }

  if (file.type !== 'application/pdf') {
     return { success: false, message: 'Loại tệp không hợp lệ. Vui lòng tải lên một tệp PDF.' };
  }

  try {
    const pdfDataUri = await fileToDataUri(file);
    const extractedData = await extractDataFromPdf(pdfDataUri);

    const allReports = await readReportData();
    allReports[month] = extractedData;
    await writeReportData(allReports);
    
    return { 
        success: true, 
        message: `Đã xử lý và lưu báo cáo cho ${month} thành công.`,
    };

  } catch (error) {
    console.error('Error in uploadReport action:', error);
    if (error instanceof Error) {
        return { success: false, message: error.message };
    }
    return { success: false, message: 'An unknown error occurred while processing the report.' };
  }
}

/**
 * Server action to load all processed report data from the JSON file.
 * @returns An object containing all report data, keyed by month.
 */
export async function loadAllReports(): Promise<Record<string, ReportData>> {
    return await readReportData();
}
