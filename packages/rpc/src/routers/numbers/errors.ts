import { TaggedError } from "better-result";

export class NumberNotFound extends TaggedError("NumberNotFound")<{
  numberId: string;
  message: string;
}> {
  constructor(args: { numberId: string }) {
    super({
      ...args,
      message: `Number ${args.numberId} was not found`,
    });
  }
}

export class MaxCountReached extends TaggedError("MaxCountReached")<{
  maxCount: number;
  message: string;
}> {
  constructor(args: { maxCount: number }) {
    super({
      ...args,
      message: `Max count ${args.maxCount} reached`,
    });
  }
}
