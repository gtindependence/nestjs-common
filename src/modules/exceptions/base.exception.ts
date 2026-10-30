import { HttpException } from "@nestjs/common";

export class BaseException extends HttpException {
    customResponse: object;

    tags: {
        [key: string]:
            | number
            | string
            | boolean
            | bigint
            | symbol
            | null
            | undefined;
    };

    error: Error;

    loggedMetadata: Record<string, unknown>;

    // This will be exposed in responses by the Filters
    appCode?: string;

    constructor(
        name: string,
        response: string | object,
        status: number,
        error?: Error
    ) {
        super(response, status);
        this.name = name;
        this.error = error;
        this.tags = {};
        this.loggedMetadata = {};
    }
}
