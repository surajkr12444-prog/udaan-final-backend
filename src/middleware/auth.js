import jwt from 'jsonwebtoken';
import User from '../models/User.js';

async function resolveUserFromHeader(req) {
  const header = req.headers.authorization || '';
  if (!header.startsWith('Bearer ')) return null;

  const token = header.slice(7).trim();
  if (!token) return null;

  const payload = jwt.verify(token, process.env.JWT_SECRET);
  return User.findById(payload.sub).select('-__v');
}

export async function requireAuth(req, res, next) {
  try {
    const user = await resolveUserFromHeader(req);
    if (!user) return res.status(401).json({ success: false, message: 'Authentication required' });
    req.user = user;
    next();
  } catch {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
}

export async function optionalAuth(req, _res, next) {
  try {
    req.user = await resolveUserFromHeader(req);
  } catch {
    req.user = null;
  }
  next();
}
