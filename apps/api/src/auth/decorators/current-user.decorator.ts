import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request?.user;
    if (!user) {
      return null;
    }

    const normalizedUser = {
      ...user,
      sub: user.sub ?? user.userId ?? user.id,
    };

    return data ? normalizedUser?.[data] : normalizedUser;
  },
);
