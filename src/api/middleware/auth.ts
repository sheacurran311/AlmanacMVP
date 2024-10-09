import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export const authenticateJWT = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const token = authHeader.split(' ')[1];

    jwt.verify(token, process.env.JWT_SECRET!, (err, user) => {
      if (err) {
        return res.sendStatus(403);
      }

      (req as any).user = user;
      (req as any).tenantId = (user as any).tenantId;
      next();
    });
  } else {
    res.sendStatus(401);
  }
};