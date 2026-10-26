export type SequelizeOriginalError = Error & { detail?: string };

export interface SequelizeError {
    name: string;
    message: string;
    stack: string;
    original: SequelizeOriginalError;
    parent: Error;
    sql: string;
}
