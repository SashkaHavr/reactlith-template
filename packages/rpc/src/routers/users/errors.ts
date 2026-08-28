import { TaggedError } from "better-result";

export class UserNotFound extends TaggedError("UserNotFound")<{
  userId: string;
  message: string;
}> {
  constructor(args: { userId: string }) {
    super({
      ...args,
      message: `User ${args.userId} was not found`,
    });
  }
}
