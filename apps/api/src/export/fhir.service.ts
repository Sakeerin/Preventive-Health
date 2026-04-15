import { Injectable } from '@nestjs/common';
import { FhirBundle, FhirPatient, FhirObservation } from '@preventive-health/shared';

@Injectable()
export class FhirService {
    /**
     * Maps our internal user and measurements to a FHIR Bundle
     */
    mapUserToFhirBundle(userId: string, profile: any, measurements: any[]): FhirBundle {
        const patient: FhirPatient = {
            resourceType: 'Patient',
            id: userId,
            active: true,
            name: [
                {
                    use: 'official',
                    family: profile?.lastName || 'Unknown',
                    given: [profile?.firstName || 'Unknown'],
                }
            ],
            gender: profile?.gender === 'M' ? 'male' : profile?.gender === 'F' ? 'female' : 'unknown',
            birthDate: profile?.birthDate || '1970-01-01',
        };

        const observations: FhirObservation[] = measurements.map((m, index) => {
            return {
                resourceType: 'Observation',
                id: `obs-${index}`,
                status: 'final',
                code: {
                    coding: [
                        {
                            system: 'http://loinc.org',
                            code: m.type === 'HEART_RATE' ? '8867-4' : 'unknown',
                            display: m.type,
                        }
                    ],
                    text: m.type
                },
                subject: {
                    reference: `Patient/${userId}`
                },
                effectiveDateTime: m.timestamp || new Date().toISOString(),
                valueQuantity: {
                    value: m.value,
                    unit: m.unit,
                    system: 'http://unitsofmeasure.org',
                    code: m.unit
                }
            };
        });

        const entries = [
            {
                fullUrl: `urn:uuid:${userId}`,
                resource: patient,
            },
            ...observations.map(obs => ({
                fullUrl: `urn:uuid:${obs.id}`,
                resource: obs,
            }))
        ];

        return {
            resourceType: 'Bundle',
            type: 'document',
            total: entries.length,
            entry: entries as any, // Cast due to strict union array checking in some TS configs
        };
    }
}
