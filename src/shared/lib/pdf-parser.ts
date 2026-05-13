import type { PDFPageProxy } from 'pdfjs-dist';

export interface ExtractedPath {
  points: [number, number][];
  type: 'line' | 'bezier';
}

export interface PDFArchaeologyResult {
  paths: ExtractedPath[];
  dimensions: { text: string, value: number, unit: string }[];
}

export async function parseDigitalArchaeology(file: File): Promise<PDFArchaeologyResult> {
  const pdfjs = await import('pdfjs-dist');

  // Set worker path - using a CDN that matches the version in package.json
  const version = '4.4.168';
  pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${version}/pdf.worker.min.mjs`;

  const { createWorker } = await import('tesseract.js');

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
  const page = await pdf.getPage(1);
  const operatorList = await page.getOperatorList();

  const paths: ExtractedPath[] = [];
  let currentPath: [number, number][] = [];

  // Robust vector extraction from PDF operators
  for (let i = 0; i < operatorList.fnArray.length; i++) {
    const fn = operatorList.fnArray[i];
    const args = operatorList.argsArray[i];

    switch (fn) {
      case (pdfjs as any).OPS.moveTo:
        if (currentPath.length > 0) {
          paths.push({ points: currentPath, type: 'line' });
        }
        currentPath = [[args[0], -args[1]]]; // Flip Y for CAD space
        break;
      case (pdfjs as any).OPS.lineTo:
        currentPath.push([args[0], -args[1]]);
        break;
      case (pdfjs as any).OPS.curveTo: {
        const [cp1x, cp1y, cp2x, cp2y, x, y] = args;
        const last = currentPath[currentPath.length - 1] || [0, 0];
        // Adaptive sampling for bezier
        const steps = 10;
        for (let t = 1/steps; t <= 1; t += 1/steps) {
          const cx = Math.pow(1-t, 3) * last[0] + 3 * Math.pow(1-t, 2) * t * cp1x + 3 * (1-t) * Math.pow(t, 2) * cp2x + Math.pow(t, 3) * x;
          const cy = Math.pow(1-t, 3) * last[1] + 3 * Math.pow(1-t, 2) * t * (-cp1y) + 3 * (1-t) * Math.pow(t, 2) * (-cp2y) + Math.pow(t, 3) * (-y);
          currentPath.push([cx, cy]);
        }
        break;
      }
      case (pdfjs as any).OPS.closePath:
        if (currentPath.length > 0) {
          currentPath.push(currentPath[0]);
          paths.push({ points: currentPath, type: 'line' });
          currentPath = [];
        }
        break;
    }
  }
  if (currentPath.length > 0) {
    paths.push({ points: currentPath, type: 'line' });
  }

  // OCR for dimensions with high-fidelity rendering
  const viewport = page.getViewport({ scale: 4.0 }); // Higher scale for better OCR
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  canvas.height = viewport.height;
  canvas.width = viewport.width;

  await (page as any).render({ canvasContext: context!, viewport }).promise;

  const worker = await createWorker('eng');
  const { data: { text } } = await worker.recognize(canvas);
  await worker.terminate();

  // Advanced dimension regex extraction
  const dimensions: { text: string, value: number, unit: string }[] = [];
  const dimRegex = /(\d+(\.\d+)?)\s*(mm|cm|in|m|deg|°)/gi;
  let match;
  while ((match = dimRegex.exec(text)) !== null) {
    dimensions.push({
      text: match[0],
      value: parseFloat(match[1]),
      unit: match[3].toLowerCase()
    });
  }

  return {
    paths: paths.filter(p => p.points.length > 2), // Filter out noise
    dimensions
  };
}
