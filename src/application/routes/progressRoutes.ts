import { Router } from 'express';
import { ProgressController } from '../controllers/ProgressController';
import { authMiddleware } from '../middleware/authMiddleware';

export function createProgressRouter(controller: ProgressController): Router {
  const router = Router();

  router.use(authMiddleware);
  router.get('/', controller.getProgress);
  router.put('/', controller.syncProgress);

  return router;
}
