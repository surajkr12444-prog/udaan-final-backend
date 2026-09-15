import jwt from 'jsonwebtoken';

export function generateToken(user) {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET is missing in environment variables');

  return jwt.sign(
    { sub: user._id.toString(), role: user.role, email: user.email },
    secret,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}
