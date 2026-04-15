import { Injectable } from '@nestjs/common';
import { Measurement } from '@preventive-health/database';

@Injectable()
export class PdfService {
    /**
     * Generates a mock PDF buffer based on health summary context.
     * In a real application, this would utilize pdfkit, Puppeteer, or similar tools.
     */
    async generateHealthSummaryPdf(
        userId: string,
        data: {
            fullName: string;
            generatedAt: string;
            measurements: Measurement[];
        }
    ): Promise<Buffer> {
        const latestMeasurements = data.measurements.slice(0, 5);
        // Mock PDF Buffer representation
        const mockPdfOutput = `
            Preventive Health Application - Health Summary
            ------------------------------------------------
            Patient ID: ${userId}
            Patient Name: ${data.fullName}
            Total Measurements: ${data.measurements.length}
            Latest Measurements:
            ${latestMeasurements
                .map(
                    (measurement) =>
                        `- ${measurement.type}: ${measurement.value} ${measurement.unit} @ ${measurement.recordedAt.toISOString()}`
                )
                .join('\n')}
            Generated At: ${data.generatedAt}
            
            -- End of Document --
        `;

        return Buffer.from(mockPdfOutput, 'utf-8');
    }
}
