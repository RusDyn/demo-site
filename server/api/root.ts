import { router } from "./trpc";
import { healthRouter } from "./routers/health";
import { profileRouter } from "./routers/profile";
import { aiRouter } from "./routers/ai";
import { caseStudyRouter } from "./routers/case-study";

export const appRouter = router({
  health: healthRouter,
  profile: profileRouter,
  ai: aiRouter,
  caseStudy: caseStudyRouter,
});

export type AppRouter = typeof appRouter;
