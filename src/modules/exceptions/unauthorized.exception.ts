import { HttpStatus } from '@nestjs/common';
import { PassiveException } from './passive.exception';

export class UnauthorizedException extends PassiveException {
    constructor(
        message?: string | object,
        options?: {
            appCode?: string;
        }
    ) {
        super('UnauthorizedException', message || 'Unauthorized', HttpStatus.UNAUTHORIZED);

        if (options?.appCode) {
            this.appCode = options.appCode;
        }
    }
}
