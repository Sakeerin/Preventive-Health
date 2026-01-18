import { PrismaClient } from '@prisma/client';
import { randomBytes, createHash } from 'crypto';

const prisma = new PrismaClient();

/**
 * Hash password (placeholder - use bcrypt in production)
 */
function hashPassword(password: string): string {
    return createHash('sha256').update(password).digest('hex');
}

/**
 * Seed the database with test data
 */
async function main() {
    console.log('🌱 Starting database seed...');

    // Clean existing data
    console.log('Cleaning existing data...');
    await prisma.auditLog.deleteMany();
    await prisma.shareGrant.deleteMany();
    await prisma.attachment.deleteMany();
    await prisma.message.deleteMany();
    await prisma.consultationThread.deleteMany();
    await prisma.booking.deleteMany();
    await prisma.provider.deleteMany();
    await prisma.modelEvidenceLog.deleteMany();
    await prisma.riskScore.deleteMany();
    await prisma.riskModelVersion.deleteMany();
    await prisma.insight.deleteMany();
    await prisma.notification.deleteMany();
    await prisma.reminderRule.deleteMany();
    await prisma.goal.deleteMany();
    await prisma.dailyAggregate.deleteMany();
    await prisma.workoutSession.deleteMany();
    await prisma.sleepSession.deleteMany();
    await prisma.measurement.deleteMany();
    await prisma.dataSource.deleteMany();
    await prisma.session.deleteMany();
    await prisma.device.deleteMany();
    await prisma.consent.deleteMany();
    await prisma.profile.deleteMany();
    await prisma.user.deleteMany();

    // Create test users
    console.log('Creating users...');
    const user1 = await prisma.user.create({
        data: {
            email: 'john.doe@example.com',
            passwordHash: hashPassword('Password123!'),
            firstName: 'John',
            lastName: 'Doe',
            dateOfBirth: new Date('1990-05-15'),
            emailVerified: true,
            profile: {
                create: {
                    gender: 'MALE',
                    height: 180,
                    weight: 75,
                    activityLevel: 'MODERATE',
                    healthGoals: ['increase_activity', 'improve_sleep'],
                    timezone: 'Asia/Bangkok',
                },
            },
            consents: {
                create: [
                    {
                        type: 'DATA_COLLECTION',
                        granted: true,
                        version: '1.0',
                        grantedAt: new Date(),
                    },
                    {
                        type: 'HEALTH_DATA_SHARING',
                        granted: true,
                        version: '1.0',
                        grantedAt: new Date(),
                    },
                ],
            },
        },
    });

    const user2 = await prisma.user.create({
        data: {
            email: 'jane.smith@example.com',
            passwordHash: hashPassword('Password123!'),
            firstName: 'Jane',
            lastName: 'Smith',
            dateOfBirth: new Date('1985-08-22'),
            emailVerified: true,
            profile: {
                create: {
                    gender: 'FEMALE',
                    height: 165,
                    weight: 60,
                    activityLevel: 'ACTIVE',
                    healthGoals: ['lose_weight', 'improve_heart_health'],
                    timezone: 'America/New_York',
                },
            },
            consents: {
                create: [
                    {
                        type: 'DATA_COLLECTION',
                        granted: true,
                        version: '1.0',
                        grantedAt: new Date(),
                    },
                ],
            },
        },
    });

    console.log(`Created users: ${user1.email}, ${user2.email}`);

    // Create devices for user1
    console.log('Creating devices...');
    const device1 = await prisma.device.create({
        data: {
            userId: user1.id,
            deviceId: randomBytes(16).toString('hex'),
            platform: 'IOS',
            model: 'iPhone 15 Pro',
            osVersion: '17.2',
            appVersion: '1.0.0',
            dataSources: {
                create: [
                    {
                        sourceType: 'HEALTHKIT',
                        sourceName: 'Apple Watch Series 9',
                        isConnected: true,
                        lastSyncAt: new Date(),
                    },
                ],
            },
        },
        include: { dataSources: true },
    });

    // Create sample measurements
    console.log('Creating measurements...');
    const today = new Date();
    const dataSourceId = device1.dataSources[0].id;

    for (let i = 0; i < 7; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);

        // Steps
        await prisma.measurement.create({
            data: {
                userId: user1.id,
                dataSourceId,
                type: 'STEPS',
                value: 8000 + Math.floor(Math.random() * 4000),
                unit: 'count',
                recordedAt: date,
            },
        });

        // Heart rate
        await prisma.measurement.create({
            data: {
                userId: user1.id,
                dataSourceId,
                type: 'HEART_RATE',
                value: 65 + Math.floor(Math.random() * 15),
                unit: 'bpm',
                recordedAt: date,
            },
        });

        // Daily aggregate
        await prisma.dailyAggregate.create({
            data: {
                userId: user1.id,
                date: new Date(date.toISOString().split('T')[0]),
                steps: 8000 + Math.floor(Math.random() * 4000),
                activeEnergy: 300 + Math.floor(Math.random() * 200),
                sleepDuration: 360 + Math.floor(Math.random() * 120),
                averageHeartRate: 65 + Math.floor(Math.random() * 10),
                restingHeartRate: 55 + Math.floor(Math.random() * 10),
                workoutCount: Math.floor(Math.random() * 2),
                workoutDuration: Math.floor(Math.random() * 60),
            },
        });
    }

    // Create goals
    console.log('Creating goals...');
    await prisma.goal.createMany({
        data: [
            {
                userId: user1.id,
                type: 'STEPS',
                targetValue: 10000,
                unit: 'count',
                frequency: 'DAILY',
                startDate: today,
            },
            {
                userId: user1.id,
                type: 'SLEEP_DURATION',
                targetValue: 480,
                unit: 'minutes',
                frequency: 'DAILY',
                startDate: today,
            },
        ],
    });

    // Create risk model version
    console.log('Creating risk models...');
    const riskModel = await prisma.riskModelVersion.create({
        data: {
            version: '1.0.0',
            modelType: 'general_wellness',
            description: 'Initial wellness risk scoring model',
            isActive: true,
            deployedAt: new Date(),
        },
    });

    // Create risk score
    await prisma.riskScore.create({
        data: {
            userId: user1.id,
            modelVersionId: riskModel.id,
            category: 'general_wellness',
            level: 'LOW',
            score: 28,
            confidence: 0.85,
            factors: [
                {
                    name: 'Good Activity',
                    contribution: -0.2,
                    description: 'Meeting daily step goals',
                },
                {
                    name: 'Adequate Sleep',
                    contribution: -0.15,
                    description: 'Average sleep duration in healthy range',
                },
            ],
        },
    });

    // Create provider
    console.log('Creating providers...');
    const provider = await prisma.provider.create({
        data: {
            type: 'DOCTOR',
            name: 'Dr. Sarah Chen',
            title: 'MD',
            specialty: 'Internal Medicine',
            bio: 'Board-certified internist with 15 years of experience in preventive medicine.',
            isVerified: true,
            availability: {
                monday: ['09:00-12:00', '14:00-17:00'],
                tuesday: ['09:00-12:00', '14:00-17:00'],
                wednesday: ['09:00-12:00'],
                thursday: ['09:00-12:00', '14:00-17:00'],
                friday: ['09:00-12:00', '14:00-17:00'],
            },
        },
    });

    // Create booking
    console.log('Creating bookings...');
    const bookingDate = new Date();
    bookingDate.setDate(bookingDate.getDate() + 7);
    bookingDate.setHours(10, 0, 0, 0);

    await prisma.booking.create({
        data: {
            userId: user1.id,
            providerId: provider.id,
            type: 'VIDEO_CALL',
            status: 'CONFIRMED',
            scheduledAt: bookingDate,
            duration: 30,
            notes: 'Follow-up consultation for wellness review',
        },
    });

    // Create insights
    console.log('Creating insights...');
    await prisma.insight.createMany({
        data: [
            {
                userId: user1.id,
                type: 'ACHIEVEMENT',
                title: 'Step Goal Streak!',
                description: 'You have met your step goal for 5 days in a row. Keep it up!',
                priority: 'LOW',
                actionable: false,
            },
            {
                userId: user1.id,
                type: 'RECOMMENDATION',
                title: 'Improve Your Sleep',
                description: 'Try going to bed 30 minutes earlier to reach your sleep goal.',
                priority: 'MEDIUM',
                actionable: true,
                actionType: 'link',
                actionTarget: '/goals/sleep',
            },
        ],
    });

    console.log('✅ Database seed completed successfully!');
}

main()
    .catch((e) => {
        console.error('❌ Seed failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
