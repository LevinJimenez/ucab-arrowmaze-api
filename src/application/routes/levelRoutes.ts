import { Router } from 'express';
import { LevelController } from '../controllers/LevelController';
import { authMiddleware } from '../middleware/authMiddleware';

export function createLevelRouter(controller: LevelController): Router {
  const router = Router();

  router.get('/', controller.getAll);
  router.get('/:id', controller.getById);
  router.put('/:id', authMiddleware, controller.upsert);

  return router;
}
