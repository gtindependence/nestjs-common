import { HttpStatus } from '@nestjs/common';
import { PassiveException } from './passive.exception';

export class ConflictException extends PassiveException {
    constructor(error: Error | null, conflictDescription: string) {
        super('ConflictException', conflictDescription, HttpStatus.CONFLICT, error);
    }
}
