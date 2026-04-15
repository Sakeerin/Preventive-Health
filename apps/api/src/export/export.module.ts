import { Module } from '@nestjs/common';
import { ExportController } from './export.controller';
import { FhirService } from './fhir.service';
import { PdfService } from './pdf.service';
import { ExportService } from './export.service';
import { DatabaseModule } from '../database/database.module';

@Module({
    imports: [DatabaseModule],
    controllers: [ExportController],
    providers: [FhirService, PdfService, ExportService],
    exports: [FhirService, PdfService, ExportService],
})
export class ExportModule {}
