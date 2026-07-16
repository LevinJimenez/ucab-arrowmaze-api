import { Router, RequestHandler } from 'express';
import rateLimit from 'express-rate-limit';
import { LevelController } from '../controllers/LevelController';

// POST /levels/generate llama a un LLM de pago: se limita el abuso/costo antes
// de siquiera verificar el JWT.
const generateRateLimiter = rateLimit({
  windowMs: 60_000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
});

export function createLevelRouter(controller: LevelController, authMiddleware: RequestHandler): Router {
  const router = Router();

  router.get('/', controller.getAll);
  router.get('/:id', controller.getById);
  router.put('/:id', authMiddleware, controller.upsert);
  router.post('/generate', generateRateLimiter, authMiddleware, controller.generate);

  return router;
}
