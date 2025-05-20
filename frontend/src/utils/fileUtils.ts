import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist';
// The workerSrc should ideally be set once globally, e.g., in main.tsx or App.tsx root.
// For now, this util assumes it's set elsewhere or we re-set it if this is the first point of use.
// If GlobalWorkerOptions.workerSrc is not set before getDocument is called, it can lead to errors.
// Ensure it's set in your app's entry point or a top-level component.
// GlobalWorkerOptions.workerSrc = `/pdf.worker.min.mjs`; // Example, ensure this path is correct

import mammoth from 'mammoth';

/**
 * Extracts text content from a given File object.
 * Supports .txt, .pdf, and .docx files.
 * @param file The File object to parse.
 * @returns A Promise that resolves with the extracted text content as a string.
 * @throws An error if the file type is unsupported or parsing fails.
 */
export async function extractTextFromFile(file: File): Promise<string> {
  if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
    return await file.text();
  } else if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
    const arrayBuffer = await file.arrayBuffer();
    // Ensure worker is configured before calling getDocument
    if (!GlobalWorkerOptions.workerSrc) {
      console.warn("pdf.js workerSrc not set. Attempting to set to default /pdf.worker.min.mjs. Ensure this file is in your public directory.");
      GlobalWorkerOptions.workerSrc = `/pdf.worker.min.mjs`;
    }
    const pdf = await getDocument({ data: arrayBuffer }).promise;
    let text = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      text += textContent.items
        .filter(item => 'str' in item && typeof (item as any).str === 'string')
        .map(item => (item as any).str)
        .join(' ') + '\n';
    }
    return text;
  } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || file.name.endsWith('.docx')) {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer: arrayBuffer });
    return result.value;
  } else {
    throw new Error('Unsupported file type. Please use .txt, .pdf, or .docx');
  }
} 