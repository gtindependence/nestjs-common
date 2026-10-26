import { AxiosError } from 'axios';

export interface AxiosExceptionOriginal {
    config: AxiosError['config'];
    response: {
        status: number;
        statusText: string;
        headers: unknown;
        data: unknown;
    };
}

export class AxiosExceptionError extends Error {
    message: string;
    stack: string;
    original?: AxiosExceptionOriginal;

    constructor(error: AxiosError) {
        super();

        if (error) {
            if (error.response) {
                this.message = `${error.response.status} - ${error.response.statusText}`;
                this.original = {
                    config: error.config,
                    response: {
                        status: error.response.status,
                        statusText: error.response.statusText,
                        headers: error.response.headers,
                        data: error.response.data
                    }
                };
            }
            else {
                this.message = error.message;
            }

            this.stack = error.stack;
        }
    }
}
