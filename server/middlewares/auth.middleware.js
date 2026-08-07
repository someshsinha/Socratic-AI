import { auth } from 'express-oauth2-jwt-bearer';
import dotenv from 'dotenv';

dotenv.config();

export const checkJwt = auth({
  audience: process.env.AUTH0_AUDIENCE,
  issuerBaseURL: `https://${process.env.AUTH0_DOMAIN}/`,
  tokenSigningAlg: 'RS256',
});

// Wrapper middleware to perform optional JWT validation
export const checkJwtOptional = (req, res, next) => {
  if (!req.headers.authorization) {
    return next();
  }
  return checkJwt(req, res, next);
};
