import { Router, RequestHandler } from 'express';
import { SurvivalController } from '../controllers/SurvivalController';

export function createSurvivalRouter(controller: SurvivalController, authMiddleware: RequestHandler): Router {
  const router = Router();

  router.post('/', authMiddleware, controller.submit);
  router.get('/leaderboard', controller.getLeaderboard);

  return router;
}
