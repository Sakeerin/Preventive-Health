import {
    Controller,
    Get,
    HttpException,
    HttpStatus,
    Res,
    StreamableFile,
    UseGuards,
} from '@nestjs/common';
import { FhirService } from './fhir.service';
import { PdfService } from './pdf.service';
import { ExportService } from './export.service';
import { CurrentUser, SessionAuthGuard, type AuthenticatedUser } from '../auth';
import { FastifyReply } from 'fastify';

@Controller('export')
@UseGuards(SessionAuthGuard)
export class ExportController {
    constructor(
        private readonly fhirService: FhirService,
        private readonly pdfService: PdfService,
        private readonly exportService: ExportService
    ) {}

    @Get('fhir')
    async getFhirExport(@CurrentUser() user: AuthenticatedUser) {
        await this.exportService.ensureExportAllowed(user.id);

        const exportData = await this.exportService.getExportData(user.id);
        const bundle = this.fhirService.mapUserToFhirBundle(
            user.id,
            {
                firstName: exportData.user.firstName,
                lastName: exportData.user.lastName,
                gender: exportData.profile?.gender,
                birthDate: exportData.user.dateOfBirth?.toISOString().split('T')[0],
            },
            exportData.measurements.map((measurement) => ({
                type: measurement.type,
                value: measurement.value,
                unit: measurement.unit,
                timestamp: measurement.recordedAt.toISOString(),
            }))
        );

        await this.exportService.createExportAuditLog(user.id, 'FHIR', {
            measurementCount: exportData.measurements.length,
        });

        return bundle;
    }

    @Get('pdf')
    async getPdfExport(
        @CurrentUser() user: AuthenticatedUser,
        @Res({ passthrough: true }) reply: FastifyReply
    ) {
        await this.exportService.ensureExportAllowed(user.id);

        const exportData = await this.exportService.getExportData(user.id);

        try {
            const buffer = await this.pdfService.generateHealthSummaryPdf(user.id, {
                fullName: `${exportData.user.firstName} ${exportData.user.lastName}`.trim(),
                generatedAt: new Date().toISOString(),
                measurements: exportData.measurements,
            });

            await this.exportService.createExportAuditLog(user.id, 'PDF', {
                measurementCount: exportData.measurements.length,
            });

            reply.header('Content-Type', 'application/pdf');
            reply.header(
                'Content-Disposition',
                `attachment; filename="health_summary_${user.id}.pdf"`
            );
            reply.header('Content-Length', buffer.length);

            return new StreamableFile(buffer);
        } catch (error) {
            throw new HttpException('Failed to generate PDF', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
