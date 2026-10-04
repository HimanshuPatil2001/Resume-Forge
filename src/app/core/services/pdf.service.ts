import { Injectable } from '@angular/core';
import { ToastService } from './toast.service';

@Injectable({
  providedIn: 'root'
})
export class PdfService {

  constructor(private toastService: ToastService) {}

  printResume(): void {
    if (typeof window !== 'undefined') {
      window.print();
    }
  }

  async downloadPdf(elementId: string, filename: string): Promise<void> {
    const element = document.getElementById(elementId);
    if (!element) {
      this.toastService.error('Export Error', `Could not find element #${elementId} for PDF export.`);
      return;
    }

    this.toastService.info('Preparing PDF', 'Converting resume preview to downloadable PDF...');

    try {
      // Dynamic import of html2canvas and jspdf to avoid static import breaking if libraries install asynchronously
      const html2canvasModule = await import('html2canvas');
      const jsPdfModule = await import('jspdf');

      const html2canvas = html2canvasModule.default || html2canvasModule;
      const jsPDF = jsPdfModule.jsPDF || jsPdfModule.default;

      // Temporary styling tweaks for crisp PDF rendering
      const canvas = await html2canvas(element, {
        scale: 2, // High resolution
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        windowWidth: 1200
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * pdfWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      // First page
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
      heightLeft -= pdfHeight;

      // Subsequent pages if content overflows A4 height
      while (heightLeft > 5) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
        heightLeft -= pdfHeight;
      }

      const cleanFilename = (filename || 'Resume').replace(/[^a-zA-Z0-9_-]/g, '_');
      pdf.save(`${cleanFilename}.pdf`);

      this.toastService.success('PDF Exported', `${cleanFilename}.pdf has been saved.`);
    } catch (err: any) {
      console.error('[PdfService] Error generating PDF with html2canvas/jsPDF:', err);
      // Fallback to native print if library rendering fails
      this.toastService.warning('Fallback to Print', 'Library PDF export was unavailable. Triggering native print to PDF.');
      window.print();
    }
  }
}
