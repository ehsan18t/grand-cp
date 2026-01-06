/**
 * Service Factory - Creates service instances with their dependencies.
 * Use this in pages and API routes to get properly configured services.
 */

import type { Database } from "@/db";
import {
  FavoriteRepository,
  HistoryRepository,
  PhaseRepository,
  ProblemRepository,
  StatusRepository,
  UserRepository,
} from "@/repositories";
import {
  FavoriteService,
  HistoryService,
  PhaseService,
  ProblemService,
  StatsService,
  StatusService,
  UserService,
} from "@/services";

/**
 * Create all services for a database instance.
 * Use this at the top of pages and API routes.
 */
export function createServices(db: Database) {
  // Create repositories
  const phaseRepo = new PhaseRepository(db);
  const problemRepo = new ProblemRepository(db);
  const userRepo = new UserRepository(db);
  const statusRepo = new StatusRepository(db);
  const favoriteRepo = new FavoriteRepository(db);
  const historyRepo = new HistoryRepository(db);

  // Create services
  const phaseService = new PhaseService(phaseRepo);
  const problemService = new ProblemService(problemRepo);
  const statsService = new StatsService(statusRepo, favoriteRepo);
  const statusService = new StatusService(statusRepo, problemRepo);
  const favoriteService = new FavoriteService(favoriteRepo, problemRepo);
  const historyService = new HistoryService(historyRepo);
  const userService = new UserService(userRepo);

  return {
    phaseService,
    problemService,
    statsService,
    statusService,
    favoriteService,
    historyService,
    userService,
  };
}

export type Services = ReturnType<typeof createServices>;
