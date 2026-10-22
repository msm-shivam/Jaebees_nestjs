import { registerAs } from '@nestjs/config';

export const jwtConfig = registerAs('jwt', () => {
  const envExpiresIn = process.env.JWT_EXPIRES_IN;
  // Guard against legacy short 15m/10m values so users are not kicked out every 15 minutes
  const expiresIn =
    envExpiresIn && envExpiresIn !== '15m' && envExpiresIn !== '10m' && envExpiresIn !== '900s'
      ? envExpiresIn
      : '7d';

  return {
    secret: process.env.JWT_SECRET,
    expiresIn,
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? '30d',
  };
});

