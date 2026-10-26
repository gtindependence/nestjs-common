import { Type } from '@nestjs/common';

export interface HiveApiDocConfig {
    summary: string;
    description: string;
    deprecated?: boolean;
    response: {
        status: number,
        type?: Type<unknown> | [Type<unknown>]
    };
    headers?: {
        name: string;
        description: string;
    }[];
}
