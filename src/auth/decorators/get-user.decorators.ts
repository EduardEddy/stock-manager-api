import { createParamDecorator, ExecutionContext, Logger } from "@nestjs/common";

export const GetUser = createParamDecorator((data, ctx: ExecutionContext) => {
  const logger = new Logger('GetUser');
  const req = ctx.switchToHttp().getRequest();
  const user = req.user;

  //logger.debug(`User in request: ${JSON.stringify(user)}`);

  if (!user) {
    logger.error('User not found in request');
    throw new Error("User not found");
  }

  return user;
});