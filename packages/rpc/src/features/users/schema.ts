import { Schema } from "effect";

export class UserNotFound extends Schema.TaggedError<UserNotFound>()(
  "UserNotFound",
  { userId: Schema.String },
  { httpApiStatus: 404 },
) {}
