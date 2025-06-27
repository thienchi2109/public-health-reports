'use server';

import { generativeModel } from '@/lib/firebase';
import type { ReportData } from '@/types/report-data';

// Helper function to find and parse JSON from a string that must contain a markdown code block.
function extractJson(text: string): any {
  const jsonRegex = /```json\s*([\s\S]*?)\s*```/;
  const match = text.match(jsonRegex);

  if (!match || !match[1]) {
    console.error("AI response did not contain a JSON code block. Response:", text);
    throw new Error("AI response was not in the expected format (missing JSON code block).");
  }

  try {
    return JSON.parse(match[1]);
  } catch (e) {
    console.error('Failed to parse extracted JSON:', e);
    console.error('Invalid JSON content:', match[1]);
    throw new Error('AI returned invalid JSON format inside the code block.');
  }
}


/**
 * Extracts structured data from a single PDF file for a specific month.
 * The month itself is provided by the user and is not extracted by this function.
 * @param pdfDataUri The PDF file encoded as a base64 data URI.
 * @returns A promise that resolves to the extracted data.
 */
export async function extractDataFromPdf(pdfDataUri: string): Promise<ReportData> {
  // Extract the mime type and base64 data from the data URI
  const match = pdfDataUri.match(/^data:(.+);base64,(.+)$/);
  if (!match) {
    throw new Error('Invalid data URI format');
  }
  const mimeType = match[1];
  const base64Data = match[2];

  const textPrompt = `You are a data extraction specialist. Your task is to extract specific data from a Vietnamese public health report PDF and format it as a single JSON object.

The report is for a SINGLE specific month. All required data is located in the section "I. Tình hình dịch bệnh trong tháng".

You MUST return a single JSON object inside a \`\`\`json code block. Do not add any other text.

Follow these instructions to populate the JSON fields:

1.  **"trends" object (for the line chart):**
    *   This is for the SINGLE month of the report. The arrays here must contain exactly ONE item each.
    *   **"labels"**: An array with ONE string. Use the placeholder "PlaceholderMonth". The app will replace this.
    *   **"sxh"**, **"tcm"**, **"soi"**: Arrays with ONE number each, representing the cases for "Sốt xuất huyết", "Tay chân miệng", and "Sởi" for that single month.

2.  **"composition" object (for the pie chart):** This is also for the single reporting month.
    *   **"labels"**: A fixed array: ["Sốt xuất huyết", "Tay chân miệng", "Sởi"].
    *   **"data"**: An array of three REAL case numbers for the diseases, for the single month of the report. These are the same numbers from the "trends" arrays.

3.  **"highlights" object (for the stat cards):** These are single values for the current reporting month.
    *   **"tongKhamSo"**: The number for "Tổng số lượt khám bệnh".
    *   **"khamNoiTru"**: The number for "khám và điều trị nội trú".
    *   **"tieuChay"**: The number for "Tiêu chảy".
    *   **"hiv"**: The number for "HIV/AIDS".
    *   **"naoMoCau"**: The number for "Não mô cầu".

**Example of the required JSON output:**
\`\`\`json
{
  "trends": {
    "labels": ["PlaceholderMonth"],
    "sxh": [120],
    "tcm": [60],
    "soi": [10]
  },
  "composition": {
    "labels": ["Sốt xuất huyết", "Tay chân miệng", "Sởi"],
    "data": [120, 60, 10]
  },
  "highlights": {
    "tongKhamSo": 123456,
    "khamNoiTru": 4567,
    "tieuChay": 789,
    "hiv": 12,
    "naoMoCau": 3
  }
}
\`\`\`
`;

  const pdfPart = {
    inlineData: {
      data: base64Data,
      mimeType: mimeType,
    },
  };

  try {
    const result = await generativeModel.generateContent([textPrompt, pdfPart]);
    const responseText = result.response.text();

    if (!responseText) {
      throw new Error("The AI model returned an empty response.");
    }
    
    const parsedData: ReportData = extractJson(responseText);

    // Ensure the highlights object and tongKham property exist to conform to the ReportData type.
    // The actual value of tongKham is calculated on the client-side.
    if (!parsedData.highlights) {
        parsedData.highlights = { tongKham: '', tongKhamSo: 0, khamNoiTru: 0, tieuChay: 0, hiv: 0, naoMoCau: 0 };
    } else {
        parsedData.highlights.tongKham = ''; 
    }

    return parsedData;

  } catch (error) {
    console.error("Error during Firebase AI call:", error);
    if (error instanceof Error) {
        throw new Error(`Failed to process PDF with Firebase AI: ${error.message}`);
    }
    throw new Error("An unknown error occurred while communicating with the AI model.");
  }
}
