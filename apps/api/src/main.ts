import { NestFactory } from '@nestjs/core';
import {
    FastifyAdapter,
    NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { AppModule } from './app.module';
import { PiiMaskingLogger } from './config/logger';

async function bootstrap() {
    const app = await NestFactory.create<NestFastifyApplication>(
        AppModule,
        new FastifyAdapter({ logger: false }),
        { bufferLogs: true }
    );

    // Apply the PII Masking layout globally
    app.useLogger(new PiiMaskingLogger());

    // Enable CORS for development
    app.enableCors({
        origin: ['http://localhost:3000'],
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        credentials: true,
    });

    const port = process.env.PORT || 3001;
    await app.listen(port, '0.0.0.0');

    console.log(`🚀 API Server running on http://localhost:${port}`);
}

bootstrap();
