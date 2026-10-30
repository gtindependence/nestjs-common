import { Type } from '@nestjs/common';
import { HiveApiModelProperty } from './hive-api-property.decorator';

export type FetchAllContentClass =
    | Type<unknown>
    | [Type<unknown>]
    | 'string'
    | 'number'
    | 'boolean'
    | 'integer'
    | 'array'
    | 'file'
    | 'null';

export interface FindAndCountAllInput<T> {
    count: number;
    rows: T[];
}

export interface FetchAllResponseShape<T> {
    totalElements: number;
    content: T[];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- default keeps existing untyped callers compiling
export const fetchAllResponseFactory = <T = any>(
    contentClass: FetchAllContentClass
): (new (findAndCountAll: FindAndCountAllInput<T>) => FetchAllResponseShape<T>) => {
    class FetchAllResponseClass implements FetchAllResponseShape<T> {
        @HiveApiModelProperty(`The count of total elements.`)
        totalElements: number;

        @HiveApiModelProperty('The content', {
            type: contentClass
        })
        content: T[];

        constructor(findAndCountAll: FindAndCountAllInput<T>) {
            this.totalElements = findAndCountAll.count;
            this.content = findAndCountAll.rows;
        }
    }
    return FetchAllResponseClass;
};
