import { OAuth2Client } from 'google-auth-library';
import User from '../models/User.js';
import { generateToken } from '../utils/token.js';
import { hashPassword, verifyPassword, validatePassword } from '../utils/password.js';

function publicUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    avatar: user.avatar,
    role: user.role,
    authProvider: user.authProvider,
  };
}

export async function emailSignup(req, res, next) {
  try {
    const name = String(req.body?.name || '').trim();
    const email = String(req.body?.email || '').trim().toLowerCase();
    const password = String(req.body?.password || '');

    if (name.length < 2) return res.status(400).json({ success: false, message: 'Please enter your full name' });
    if (!/^\S+@\S+\.\S+$/.test(email)) return res.status(400).json({ success: false, message: 'Please enter a valid email address' });
    const passwordError = validatePassword(password);
    if (passwordError) return res.status(400).json({ success: false, message: passwordError });

    const existing = await User.findOne({ email }).select('+passwordHash');
    if (existing) {
      const hint = existing.googleId && !existing.passwordHash
        ? 'This email is already registered with Google. Please use Continue with Google.'
        : 'An account with this email already exists. Please log in.';
      return res.status(409).json({ success: false, message: hint });
    }

    const user = await User.create({
      name,
      email,
      passwordHash: hashPassword(password),
      authProvider: 'email',
      lastLoginAt: new Date(),
    });
    const token = generateToken(user);
    res.status(201).json({ success: true, token, user: publicUser(user) });
  } catch (err) {
    next(err);
  }
}

export async function emailLogin(req, res, next) {
  try {
    const email = String(req.body?.email || '').trim().toLowerCase();
    const password = String(req.body?.password || '');
    if (!email || !password) return res.status(400).json({ success: false, message: 'Email and password are required' });

    const user = await User.findOne({ email }).select('+passwordHash');
    if (!user) return res.status(401).json({ success: false, message: 'Invalid email or password' });
    if (!user.passwordHash) {
      return res.status(400).json({ success: false, message: 'This account uses Google Sign-In. Please continue with Google.' });
    }
    if (!verifyPassword(password, user.passwordHash)) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    user.lastLoginAt = new Date();
    await user.save();
    const token = generateToken(user);
    res.json({ success: true, token, user: publicUser(user) });
  } catch (err) {
    next(err);
  }
}

export async function googleLogin(req, res, next) {
  try {
    const { credential } = req.body;
    if (!credential) return res.status(400).json({ success: false, message: 'Google credential is required' });
    if (!process.env.GOOGLE_CLIENT_ID) {
      return res.status(500).json({ success: false, message: 'GOOGLE_CLIENT_ID is not configured' });
    }

    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    const ticket = await client.verifyIdToken({ idToken: credential, audience: process.env.GOOGLE_CLIENT_ID });
    const payload = ticket.getPayload();

    if (!payload?.email || !payload?.sub) {
      return res.status(401).json({ success: false, message: 'Invalid Google account payload' });
    }

    const email = payload.email.toLowerCase();
    let user = await User.findOne({ email }).select('+passwordHash');
    if (!user) {
      user = await User.create({
        googleId: payload.sub,
        email,
        name: payload.name || email.split('@')[0],
        avatar: payload.picture || '',
        authProvider: 'google',
        lastLoginAt: new Date(),
      });
    } else {
      user.googleId ||= payload.sub;
      user.name = payload.name || user.name;
      user.avatar = payload.picture || user.avatar;
      user.lastLoginAt = new Date();
      user.authProvider = user.passwordHash ? 'linked' : 'google';
      await user.save();
    }

    const token = generateToken(user);
    res.json({ success: true, token, user: publicUser(user) });
  } catch (err) {
    if (err?.message?.toLowerCase().includes('token')) {
      return res.status(401).json({ success: false, message: 'Google sign-in verification failed' });
    }
    next(err);
  }
}

export async function me(req, res) {
  res.json({ success: true, user: publicUser(req.user) });
}
