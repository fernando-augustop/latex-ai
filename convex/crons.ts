import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();
crons.interval(
  "latex api health check",
  { minutes: 5 },
  internal.latexNode.checkHealth
);
export default crons;
