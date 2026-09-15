import { OAuth2Client } from 'google-auth-library';
import User from '../models/User.js';
import { generateToken } from '../utils/token.js';

export async function googleLogin(req, res, next) {
  try {
    const { credential } = req.body;
    if (!credential) return res.status(400).json({ success: false, message: 'Google credential is required' });
    if (!process.env.GOOGLE_CLIENT_ID) {
      return res.status(500).json({ success: false, message: 'GOOGLE_CLIENT_ID is not configured' });
    }

    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID
    });
    const payload = ticket.getPayload();

    if (!payload?.email || !payload?.sub) {
      return res.status(401).json({ success: false, message: 'Invalid Google account payload' });
    }

    let user = await User.findOne({ email: payload.email.toLowerCase() });
    if (!user) {
      user = await User.create({
        googleId: payload.sub,
        email: payload.email,
        name: payload.name || payload.email.split('@')[0],
        avatar: payload.picture || ''
      });
    } else {
      user.googleId ||= payload.sub;
      user.name = payload.name || user.name;
      user.avatar = payload.picture || user.avatar;
      user.lastLoginAt = new Date();
      await user.save();
    }

    const token = generateToken(user);
    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        role: user.role
      }
    });
  } catch (err) {
    if (err?.message?.toLowerCase().includes('token')) {
      return res.status(401).json({ success: false, message: 'Google sign-in verification failed' });
    }
    next(err);
  }
}

export async function me(req, res) {
  res.json({ success: true, user: req.user });
}
