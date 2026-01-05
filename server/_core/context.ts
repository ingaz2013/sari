import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import { authenticateRequest } from "./auth";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
};

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  console.log('[Context] createContext called');
  let user: User | null = null;

  try {
    user = await authenticateRequest(opts.req);
    console.log('[Context] User authenticated:', user?.id);
  } catch (error) {
    // Authentication is optional for public procedures.
    console.log('[Context] Auth failed:', String(error));
    user = null;
  }

  return {
    req: opts.req,
    res: opts.res,
    user,
  };
}
