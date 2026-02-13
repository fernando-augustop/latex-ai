import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();
crons.interval(
  "latex api health check",
  { minutes: 5 },
  internal.latexNode.checkHealth
);
crons.weekly(
  "cleanup old pdf storage",
  { dayOfWeek: "sunday", hourUTC: 3, minuteUTC: 0 },
  internal.latex.cleanupOldPdfStorage
);
export default crons;
