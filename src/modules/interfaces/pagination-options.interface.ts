import { SortDirection } from '../types';

export interface PaginationOptions {
    page?: number;
    size?: number;
    shift?: number;
    sortByModel?: unknown;
    sortBy?: string;
    sortDir?: SortDirection;
    filter?: string;
    search?: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- flows into typed filter constructors via InjectedDto
    user?: any;
}
