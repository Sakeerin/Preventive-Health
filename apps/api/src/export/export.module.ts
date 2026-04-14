import { Module } from '@nestjs/common';
import { ExportController } from './export.controller';
import { FhirService } from './fhir.service';
import { PdfService } from './pdf.service';

@Module({
    controllers: [ExportController],
    providers: [FhirService, PdfService],
    exports: [FhirService, PdfService],
})
export class ExportModule {}
