import { Module, Global } from '@nestjs/common';
import { PrismaClient } from '@preventive-health/database';

@Global()
@Module({
    providers: [
        {
            provide: PrismaClient,
            useFactory: () => {
                const prisma = new PrismaClient({
                    log:
                        process.env.NODE_ENV === 'development'
                            ? ['query', 'error', 'warn']
                            : ['error'],
                });
                return prisma;
            },
        },
    ],
    exports: [PrismaClient],
})
export class DatabaseModule { }
