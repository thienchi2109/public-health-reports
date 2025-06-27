'use server';

import { extractDataFromPdf } from '@/ai/flows/extract-data-from-pdf';
import type { ReportData } from '@/types/report-data';
import { 
  saveReportToFirestore, 
  loadAllReportsFromFirestore, 
  deleteReportFromFirestore 
} from '@/lib/firestore';

/**
 * Server action to upload a single PDF report, process it with Gemini,
 * and save the extracted data to Firestore.
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
    // Convert file to data URI
    const buffer = await file.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');
    const pdfDataUri = `data:${file.type};base64,${base64}`;
    
    // Extract data using AI
    const extractedData = await extractDataFromPdf(pdfDataUri);

    // Save to Firestore
    await saveReportToFirestore(month, extractedData);
    
    return { 
        success: true, 
        message: `Đã xử lý và lưu báo cáo cho ${month} thành công vào Firestore.`,
    };

  } catch (error) {
    console.error('Error in uploadReport action:', error);
    if (error instanceof Error) {
        return { success: false, message: error.message };
    }
    return { success: false, message: 'Đã xảy ra lỗi không xác định khi xử lý báo cáo.' };
  }
}

/**
 * Server action to load all processed report data from Firestore.
 * @returns An object containing all report data, keyed by month.
 */
export async function loadAllReports(): Promise<Record<string, ReportData>> {
    try {
        return await loadAllReportsFromFirestore();
    } catch (error) {
        console.error('Error loading reports:', error);
        return {};
    }
}

/**
 * Server action to delete a specific report by month from Firestore.
 * @param month The month of the report to delete.
 * @returns An object indicating success or failure with a message.
 */
export async function deleteReport(month: string): Promise<{ success: boolean; message: string }> {
  try {
    await deleteReportFromFirestore(month);
    
    return { 
      success: true, 
      message: `Đã xóa báo cáo ${month} thành công từ Firestore.` 
    };
  } catch (error) {
    console.error('Error in deleteReport action:', error);
    if (error instanceof Error) {
      return { success: false, message: error.message };
    }
    return { success: false, message: 'Đã xảy ra lỗi không xác định khi xóa báo cáo.' };
  }
}
