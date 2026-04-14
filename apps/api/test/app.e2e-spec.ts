import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
    let app: INestApplication;

    beforeEach(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        await app.init();
    });

    afterEach(async () => {
        await app.close();
    });

    it('/health (GET) should return healthy status', () => {
        return request(app.getHttpServer())
            .get('/health')
            .expect(200);
    });

    it('Should return 429 Too Many Requests if rate limit is exceeded', async () => {
        // Hammer the default test endpoint to trigger throttler
        // Requires Throttler implementation in AppModule to have a short limit for testing
        const endpoint = '/health';
        
        // This is a generic throttle check, we send excessive amounts
        for (let i = 0; i < 20; i++) {
            await request(app.getHttpServer()).get(endpoint);
        }

        return request(app.getHttpServer())
            .get(endpoint)
            .expect(429); // 429 indicates "Too Many Requests"
    });
});
