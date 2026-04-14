import { Controller, Get, Query, Res, HttpException, HttpStatus } from '@nestjs/common';
import { FhirService } from './fhir.service';
import { PdfService } from './pdf.service';
import { Response } from 'express';

@Controller('export')
export class ExportController {
    constructor(
        private readonly fhirService: FhirService,
        private readonly pdfService: PdfService
    ) {}

    @Get('fhir')
    getFhirExport(@Query('userId') userId: string) {
        if (!userId) {
            throw new HttpException('userId is required', HttpStatus.BAD_REQUEST);
        }

        // Mock generic profile and measurements retrieval
        const mockProfile = { firstName: 'Jane', lastName: 'Doe', gender: 'F', birthDate: '1985-06-15' };
        const mockMeasurements = [
            { type: 'HEART_RATE', value: 72, unit: 'beats/min', timestamp: new Date().toISOString() },
            { type: 'STEPS', value: 10500, unit: 'steps', timestamp: new Date().toISOString() }
        ];

        const bundle = this.fhirService.mapUserToFhirBundle(userId, mockProfile, mockMeasurements);
        
        return bundle; // Responds automatically as application/json
    }

    @Get('pdf')
    async getPdfExport(@Query('userId') userId: string, @Res() res: Response) {
        if (!userId) {
            throw new HttpException('userId is required', HttpStatus.BAD_REQUEST);
        }

        // Mock data fetch
        const mockMeasurements = [
            { type: 'HEART_RATE', value: 72 },
            { type: 'STEPS', value: 10500 }
        ];

        try {
            const buffer = await this.pdfService.generateHealthSummaryPdf(userId, { measurements: mockMeasurements });
            
            res.set({
                'Content-Type': 'application/pdf',
                'Content-Disposition': \`attachment; filename="health_summary_$\{userId\}.pdf"\`,
                'Content-Length': buffer.length,
            });

            res.send(buffer);
        } catch (error) {
            throw new HttpException('Failed to generate PDF', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
