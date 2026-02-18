import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const ClientUser = createParamDecorator(
    (data: string | undefined, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest();
        const clientUser = request.user;
        return data ? clientUser?.[data] : clientUser;
    },
);
