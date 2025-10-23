import { router } from "./trpc";
import { healthRouter } from "./routers/health";
import { profileRouter } from "./routers/profile";

export const appRouter = router({
  health: healthRouter,
  profile: profileRouter,
});

export type AppRouter = typeof appRouter;
