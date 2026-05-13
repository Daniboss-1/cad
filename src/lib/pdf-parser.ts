import * as pdfjs from 'pdfjs-dist';
import { createWorker } from 'tesseract.js';

// Initialize PDF.js worker
if (typeof window !== 'undefined' && 'Worker' in window) {
  pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;
}

export interface ExtractedPath {
  points: [number, number][];
  type: 'line' | 'bezier';
}

export interface PDFArchaeologyResult {
  paths: ExtractedPath[];
  dimensions: { text: string, value: number, unit: string }[];
}

export async function parseDigitalArchaeology(file: File): Promise<PDFArchaeologyResult> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
  const page = await pdf.getPage(1);
  const operatorList = await page.getOperatorList();
  
  const paths: ExtractedPath[] = [];
  let currentPath: [number, number][] = [];

  // Very simplified vector extraction from PDF operators
  // In a real "Meta-level" implementation, this would handle transform matrices and all path commands
  for (let i = 0; i < operatorList.fnArray.length; i++) {
    const fn = operatorList.fnArray[i];
    const args = operatorList.argsArray[i];

    if (fn === pdfjs.OPS.moveTo) {
      if (currentPath.length > 0) paths.push({ points: currentPath, type: 'line' });
      currentPath = [[args[0], args[1]]];
    } else if (fn === pdfjs.OPS.lineTo) {
      currentPath.push([args[0], args[1]]);
    }
  }
  if (currentPath.length > 0) paths.push({ points: currentPath, type: 'line' });

  // OCR for dimensions
  const viewport = page.getViewport({ scale: 2.0 });
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  canvas.height = viewport.height;
  canvas.width = viewport.width;
  
  await page.render({ canvasContext: context!, viewport }).promise;
  
  const worker = await createWorker('eng');
  const { data: { text } } = await worker.recognize(canvas);
  await worker.terminate();

  // Simple dimension regex extraction
  const dimensions: { text: string, value: number, unit: string }[] = [];
  const dimRegex = /(\d+(\.\d+)?)\s*(mm|cm|in|m)/gi;
  let match;
  while ((match = dimRegex.exec(text)) !== null) {
    dimensions.push({
      text: match[0],
      value: parseFloat(match[1]),
      unit: match[3].toLowerCase()
    });
  }

  return { paths, dimensions };
}
