import { Router } from 'express';
import { LeaderboardController } from '../controllers/LeaderboardController';

export function createLeaderboardRouter(controller: LeaderboardController): Router {
  const router = Router();

  router.get('/:levelId', controller.getLeaderboard);

  return router;
}
