import { Router, RequestHandler } from 'express';
import { ProgressController } from '../controllers/ProgressController';

export function createProgressRouter(controller: ProgressController, authMiddleware: RequestHandler): Router {
  const router = Router();

  router.use(authMiddleware);
  router.get('/', controller.getProgress);
  router.put('/', controller.syncProgress);

  return router;
}
