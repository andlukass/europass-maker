import { chromium } from 'playwright';
import { writeFileSync } from 'fs';

interface PdfOptions {
  zeroMargin?: boolean;
}

export async function generatePdf(html: string, outputPath: string, options?: PdfOptions): Promise<void> {
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle' });
    const margin = options?.zeroMargin
      ? { top: '0mm', right: '0mm', bottom: '0mm', left: '0mm' }
      : { top: '10mm', right: '10mm', bottom: '10mm', left: '10mm' };
    const pdfBuffer = await page.pdf({
      format: 'A4',
      margin,
      printBackground: true,
    });
    writeFileSync(outputPath, pdfBuffer);
  } finally {
    await browser.close();
  }
}
