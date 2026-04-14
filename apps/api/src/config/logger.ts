import { ConsoleLogger, Injectable } from '@nestjs/common';

@Injectable()
export class PiiMaskingLogger extends ConsoleLogger {
    private readonly SENSITIVE_KEYS = ['email', 'firstName', 'lastName', 'password', 'ssn', 'birthDate', 'phone'];

    private maskObject(obj: any): any {
        if (!obj || typeof obj !== 'object') return obj;

        if (Array.isArray(obj)) {
            return obj.map(item => this.maskObject(item));
        }

        const maskedObj = { ...obj };
        for (const key in maskedObj) {
            if (maskedObj.hasOwnProperty(key)) {
                if (this.SENSITIVE_KEYS.includes(key)) {
                    maskedObj[key] = '***';
                } else if (typeof maskedObj[key] === 'object') {
                    maskedObj[key] = this.maskObject(maskedObj[key]);
                }
            }
        }
        return maskedObj;
    }

    log(message: any, context?: string) {
        let safeMessage = message;
        if (typeof message === 'object') {
            safeMessage = this.maskObject(message);
            super.log(JSON.stringify(safeMessage), context);
        } else {
            super.log(message, context);
        }
    }

    error(message: any, trace?: string, context?: string) {
        let safeMessage = message;
        if (typeof message === 'object') {
            safeMessage = this.maskObject(message);
            super.error(JSON.stringify(safeMessage), trace, context);
        } else {
            super.error(message, trace, context);
        }
    }
}
