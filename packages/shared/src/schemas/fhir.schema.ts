import { z } from 'zod';

export const fhirIdentifierSchema = z.object({
    use: z.enum(['usual', 'official', 'temp', 'secondary', 'old']).optional(),
    system: z.string().optional(),
    value: z.string().optional(),
});

export const fhirCodeableConceptSchema = z.object({
    coding: z.array(z.object({
        system: z.string().optional(),
        code: z.string().optional(),
        display: z.string().optional(),
    })).optional(),
    text: z.string().optional(),
});

export const fhirReferenceSchema = z.object({
    reference: z.string().optional(),
    type: z.string().optional(),
    display: z.string().optional(),
});

export const fhirPatientSchema = z.object({
    resourceType: z.literal('Patient'),
    id: z.string().optional(),
    identifier: z.array(fhirIdentifierSchema).optional(),
    active: z.boolean().optional(),
    name: z.array(z.object({
        use: z.string().optional(),
        family: z.string().optional(),
        given: z.array(z.string()).optional(),
        text: z.string().optional(),
    })).optional(),
    gender: z.enum(['male', 'female', 'other', 'unknown']).optional(),
    birthDate: z.string().optional(), // YYYY-MM-DD
});

export const fhirObservationSchema = z.object({
    resourceType: z.literal('Observation'),
    id: z.string().optional(),
    status: z.enum(['registered', 'preliminary', 'final', 'amended', 'corrected', 'cancelled', 'entered-in-error', 'unknown']),
    category: z.array(fhirCodeableConceptSchema).optional(),
    code: fhirCodeableConceptSchema,
    subject: fhirReferenceSchema.optional(),
    effectiveDateTime: z.string().optional(),
    issued: z.string().optional(),
    performer: z.array(fhirReferenceSchema).optional(),
    valueQuantity: z.object({
        value: z.number().optional(),
        unit: z.string().optional(),
        system: z.string().optional(),
        code: z.string().optional(),
    }).optional(),
});

export const fhirBundleEntrySchema = z.object({
    fullUrl: z.string().optional(),
    resource: z.union([fhirPatientSchema, fhirObservationSchema]),
});

export const fhirBundleSchema = z.object({
    resourceType: z.literal('Bundle'),
    type: z.enum(['document', 'message', 'transaction', 'transaction-response', 'batch', 'batch-response', 'history', 'searchset', 'collection']),
    total: z.number().optional(),
    entry: z.array(fhirBundleEntrySchema).optional(),
});

// Type exports
export type FhirPatient = z.infer<typeof fhirPatientSchema>;
export type FhirObservation = z.infer<typeof fhirObservationSchema>;
export type FhirBundle = z.infer<typeof fhirBundleSchema>;
