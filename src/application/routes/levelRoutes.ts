import { Router, RequestHandler } from 'express';
import { LevelController } from '../controllers/LevelController';

export function createLevelRouter(controller: LevelController, authMiddleware: RequestHandler): Router {
  const router = Router();

  router.get('/', controller.getAll);
  router.get('/:id', controller.getById);
  router.put('/:id', authMiddleware, controller.upsert);

  return router;
}
