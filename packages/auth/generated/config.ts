import {createAuth} from "../src/index"
import { createDB } from "@reactlith-template/db";

export const auth = createAuth(createDB())

