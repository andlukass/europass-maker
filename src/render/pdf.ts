import { chromium } from 'playwright';
import { writeFileSync } from 'fs';

export async function generatePdf(html: string, outputPath: string): Promise<void> {
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle' });
    const pdfBuffer = await page.pdf({
      format: 'A4',
      margin: { top: '10mm', right: '10mm', bottom: '10mm', left: '10mm' },
      printBackground: true,
    });
    writeFileSync(outputPath, pdfBuffer);
  } finally {
    await browser.close();
  }
}
