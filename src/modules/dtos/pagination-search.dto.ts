import { IsOptional } from 'class-validator';
import { HiveApiModelProperty } from '../decorators';
import { PaginationOptions } from '../interfaces';
import { Pagination } from './pagination.dto';


export class PaginationSearch extends Pagination {
    @HiveApiModelProperty(`Term to search by`)
    @IsOptional()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Heavy usage, not easy to type
    search: string | any;

    searchTerm: string;

    constructor(options: PaginationOptions, defaultSortBy: string) {
        super(options, defaultSortBy);

        this.searchTerm = options.search;
    }
}
