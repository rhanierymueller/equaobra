import jwt from 'jsonwebtoken'

import type { JwtPayload } from '../middleware/auth'

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, process.env.JWT_SECRET!, {
    algorithm: 'HS256',
    expiresIn: '1d',
    issuer: 'equaobra-api',
  })
}
