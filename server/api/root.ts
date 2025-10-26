import { router } from "./trpc";
import { healthRouter } from "./routers/health";
import { profileRouter } from "./routers/profile";
import { aiRouter } from "./routers/ai";

export const appRouter = router({
  health: healthRouter,
  profile: profileRouter,
  ai: aiRouter,
});

export type AppRouter = typeof appRouter;
