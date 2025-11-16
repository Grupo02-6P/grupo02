import { Injectable } from '@nestjs/common';
import { IReportFormatter } from '../abstractions/i-report-formatter.abstract';
import { ReportData } from '../types/report-data.type';
import PDFDocument from 'pdfkit';

@Injectable()
export class PdfFormatter implements IReportFormatter {
  async format(data: ReportData): Promise<Buffer> {
    const buildPdf = (
      reportData: ReportData,
      done: (buffer: Buffer) => void,
    ) => {
      const doc = new PDFDocument({ margin: 50 });
      const buffers: Buffer[] = [];

      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        done(Buffer.concat(buffers));
      });

      // Adiciona o conteúdo
      doc
        .fontSize(18)
        .text(reportData.title, { align: 'center' });

      doc.moveDown();

      doc
        .fontSize(10)
        .text(JSON.stringify(reportData.data, null, 2));

      // Finaliza o documento
      doc.end();
    };

    return new Promise(resolve => {
      buildPdf(data, buffer => {
        resolve(buffer);
      });
    });
  }
}
