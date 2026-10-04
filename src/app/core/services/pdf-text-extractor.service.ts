import { Injectable } from '@angular/core';

declare const pdfjsLib: any;

@Injectable({
  providedIn: 'root'
})
export class PdfTextExtractorService {

  private isPdfJsLoaded = false;
  private pdfJsCdnUrl = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
  private workerCdnUrl = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

  private loadPdfJs(): Promise<void> {
    if (this.isPdfJsLoaded || (typeof window !== 'undefined' && (window as any).pdfjsLib)) {
      this.isPdfJsLoaded = true;
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = this.pdfJsCdnUrl;
      script.onload = () => {
        this.isPdfJsLoaded = true;
        if ((window as any).pdfjsLib) {
          (window as any).pdfjsLib.GlobalWorkerOptions.workerSrc = this.workerCdnUrl;
        }
        resolve();
      };
      script.onerror = () => reject(new Error('Failed to load PDF parsing engine from CDN.'));
      document.head.appendChild(script);
    });
  }

  async extractTextFromPdf(file: File): Promise<string> {
    await this.loadPdfJs();

    const lib = (window as any).pdfjsLib;
    if (!lib) {
      throw new Error('PDF.js library is not available.');
    }

    const arrayBuffer = await file.arrayBuffer();
    const pdfDocument = await lib.getDocument({ data: arrayBuffer }).promise;
    
    let fullText = '';
    const extractedLinks: string[] = [];

    for (let i = 1; i <= pdfDocument.numPages; i++) {
      const page = await pdfDocument.getPage(i);
      const tokenizedText = await page.getTextContent();
      
      const pageText = tokenizedText.items
        .map((item: any) => item.str)
        .join(' ');
      
      fullText += pageText + '\n\n';

      // Extract PDF Hyperlink Annotations (clickable URLs in PDF)
      try {
        const annotations = await page.getAnnotations();
        if (Array.isArray(annotations)) {
          annotations.forEach((annot: any) => {
            if (annot.subtype === 'Link') {
              const targetUrl = annot.url || annot.unsafeUrl;
              if (targetUrl && typeof targetUrl === 'string' && targetUrl.startsWith('http')) {
                const cleanUrl = targetUrl.trim();
                if (!extractedLinks.includes(cleanUrl)) {
                  extractedLinks.push(cleanUrl);
                }
              }
            }
          });
        }
      } catch (err) {
        console.warn(`[PdfTextExtractorService] Could not extract annotations for page ${i}:`, err);
      }
    }

    if (extractedLinks.length > 0) {
      fullText += '\n\n--- EXTRACTED PDF EMBEDDED HYPERLINKS ---\n' + extractedLinks.join('\n') + '\n--- END HYPERLINKS ---';
    }

    return fullText.trim();
  }
}
