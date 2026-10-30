import { HttpStatus } from '@nestjs/common';
import { AxiosError } from 'axios';
import { AxiosExceptionError } from '../classes';
import { LoggedException } from './logged.exception';

export class AxiosException extends LoggedException {
    constructor(error: AxiosError, customMessage?: string) {
        super(
            'AxiosException',
            customMessage || 'Internal server error with request',
            HttpStatus.INTERNAL_SERVER_ERROR,
            new AxiosExceptionError(error)
        );
    }
}
