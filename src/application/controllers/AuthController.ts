import { Request, Response } from 'express';
import jwt, { SignOptions } from 'jsonwebtoken';
import { z } from 'zod';
import { RegisterUserInput, RegisterUserOutput } from '../../domain/use-cases/RegisterUserUseCase';
import { AuthenticateUserInput, AuthenticateUserOutput } from '../../domain/use-cases/AuthenticateUserUseCase';
import { IUseCase } from '../../domain/interfaces/IUseCase';
import { ResponseFactory } from '../factories/ResponseFactory';
import { env } from '../../config/env';

const registerSchema = z.object({
  username: z.string().min(3).max(30),
  email: z.string().email(),
  password: z.string().min(6),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export class AuthController {
  constructor(
    private readonly registerUseCase: IUseCase<RegisterUserInput, RegisterUserOutput>,
    private readonly authenticateUseCase: IUseCase<AuthenticateUserInput, AuthenticateUserOutput>,
  ) {}

  public register = async (req: Request, res: Response): Promise<void> => {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      ResponseFactory.error(res, 'Validation error: ' + parsed.error.message, 422);
      return;
    }

    const user = await this.registerUseCase.execute(parsed.data);
    const token = this.generateToken(user.id, user.username);

    ResponseFactory.created(res, { user, token });
  };

  public login = async (req: Request, res: Response): Promise<void> => {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      ResponseFactory.error(res, 'Validation error: ' + parsed.error.message, 422);
      return;
    }

    const payload = await this.authenticateUseCase.execute(parsed.data);
    const token = this.generateToken(payload.userId, payload.username);

    ResponseFactory.success(res, { user: payload, token });
  };

  private generateToken(userId: string, username: string): string {
    const options: SignOptions = { expiresIn: env.JWT_EXPIRES_IN as SignOptions['expiresIn'] };
    return jwt.sign({ userId, username }, env.JWT_SECRET, options);
  }
}
