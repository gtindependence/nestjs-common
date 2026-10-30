import { AxiosExceptionOriginal } from './axios-exception-error';

export class DocumentServiceExceptionError extends Error {
    message: string;
    stack: string;
    original?: AxiosExceptionOriginal;

    constructor(error: Error & { original?: AxiosExceptionOriginal }) {
        super();

        if (error) {
            this.message = error.message;
            this.stack = error.stack;
            this.original = error.original;
        }
    }
}
