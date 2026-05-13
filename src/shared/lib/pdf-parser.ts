import type { PDFPageProxy } from 'pdfjs-dist';

export interface ExtractedPath {
  points: [number, number][];
  type: 'line' | 'bezier';
}

export interface PDFArchaeologyResult {
  paths: ExtractedPath[];
  dimensions: { text: string, value: number, unit: string, confidence: number }[];
  auditTrail: string[];
}

let pdfjsInstance: any = null;
let tesseractWorker: any = null;

async function getPDFJS() {
  if (!pdfjsInstance) {
    const pdfjs = await import('pdfjs-dist');
    const version = '5.7.284';
    pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${version}/pdf.worker.min.mjs`;
    pdfjsInstance = pdfjs;
  }
  return pdfjsInstance;
}

async function getTesseractWorker() {
  if (!tesseractWorker) {
    const { createWorker } = await import('tesseract.js');
    tesseractWorker = await createWorker('eng');
  }
  return tesseractWorker;
}

export async function parseDigitalArchaeology(
  file: File, 
  options: { deepScan?: boolean } = {}
): Promise<PDFArchaeologyResult> {
  const auditTrail: string[] = [];
  auditTrail.push(`Initialization: Started analysis of ${file.name} (${(file.size/1024).toFixed(1)} KB)`);
  
  const pdfjs = await getPDFJS();
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
  auditTrail.push(`PDF.js: Document loaded with ${pdf.numPages} page(s)`);
  
  const page = await pdf.getPage(1);
  const operatorList = await page.getOperatorList();
  auditTrail.push(`PDF.js: Extracted ${operatorList.fnArray.length} operators from Page 1`);
  
  const paths: ExtractedPath[] = [];
  let currentPath: [number, number][] = [];

  const addPath = (p: [number, number][]) => {
    if (p.length > 1) {
      paths.push({ points: [...p], type: 'line' });
    }
  };

  for (let i = 0; i < operatorList.fnArray.length; i++) {
    const fn = operatorList.fnArray[i];
    const args = operatorList.argsArray[i];

    switch (fn) {
      case pdfjs.OPS.moveTo:
        addPath(currentPath);
        currentPath = [[args[0], -args[1]]];
        break;
      case pdfjs.OPS.lineTo:
        currentPath.push([args[0], -args[1]]);
        break;
      case pdfjs.OPS.curveTo: {
        const [cp1x, cp1y, cp2x, cp2y, x, y] = args;
        const last = currentPath[currentPath.length - 1] || [0, 0];
        const steps = 20; 
        for (let t = 1/steps; t <= 1; t += 1/steps) {
          const invT = 1 - t;
          const cx = Math.pow(invT, 3) * last[0] + 3 * Math.pow(invT, 2) * t * cp1x + 3 * invT * Math.pow(t, 2) * cp2x + Math.pow(t, 3) * x;
          const cy = Math.pow(invT, 3) * last[1] + 3 * Math.pow(invT, 2) * t * (-cp1y) + 3 * invT * Math.pow(t, 2) * (-cp2y) + Math.pow(t, 3) * (-y);
          currentPath.push([cx, cy]);
        }
        break;
      }
      case pdfjs.OPS.closePath:
        if (currentPath.length > 0) {
          const first = currentPath[0];
          const last = currentPath[currentPath.length - 1];
          if (first[0] !== last[0] || first[1] !== last[1]) {
            currentPath.push([first[0], first[1]]);
          }
          addPath(currentPath);
          currentPath = [];
        }
        break;
    }
  }
  addPath(currentPath);
  auditTrail.push(`Vector Reconstruction: Found ${paths.length} raw path segments`);

  const dimensions: { text: string, value: number, unit: string, confidence: number }[] = [];

  if (options.deepScan || true) { // Default to deepScan for better archaeology
    auditTrail.push(`OCR: Performing Deep Scan with Tesseract.js (Resolution 4.0x)`);
    const viewport = page.getViewport({ scale: 4.0 });
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.height = viewport.height;
    canvas.width = viewport.width;
    
    await page.render({ canvasContext: context!, viewport, canvas }).promise;
    
    const worker = await getTesseractWorker();
    const { data: { words } } = await worker.recognize(canvas);

    const dimRegex = /^(\d+(\.\d+)?)\s*(mm|cm|in|m|deg|°)?$/i;
    words.forEach((word: any) => {
      const match = dimRegex.exec(word.text);
      if (match) {
        dimensions.push({
          text: word.text,
          value: parseFloat(match[1]),
          unit: match[3]?.toLowerCase() || 'mm',
          confidence: word.confidence / 100
        });
      }
    });
    auditTrail.push(`OCR: Extracted ${dimensions.length} dimensional annotations`);
  }

  return { 
    paths: paths.filter(p => p.points.length >= 3),
    dimensions,
    auditTrail
  };
}
