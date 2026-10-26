import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const QueryUser = createParamDecorator((_data, ctx: ExecutionContext): unknown => {
    const req = ctx.switchToHttp().getRequest();
    return {
        user: req.user || {},
        ...req.query
    };
});
