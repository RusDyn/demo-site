import { router } from "./trpc";
import { aiRouter } from "./routers/ai";
import { analyticsRouter } from "./routers/analytics";
import { healthRouter } from "./routers/health";
import { profileRouter } from "./routers/profile";
import { caseStudyRouter } from "./routers/case-study";

export const appRouter = router({
  health: healthRouter,
  profile: profileRouter,
  ai: aiRouter,
  caseStudy: caseStudyRouter,
  analytics: analyticsRouter,
});

export type AppRouter = typeof appRouter;
