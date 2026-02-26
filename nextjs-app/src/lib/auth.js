import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key_123';

export function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });
}

export function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

export function getAuthUser(request) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader) return null;
  const token = authHeader.split(' ')[1];
  if (!token) return null;
  try {
    return verifyToken(token);
  } catch {
    return null;
  }
}

export function requireAuth(request) {
  const user = getAuthUser(request);
  if (!user) {
    return { error: 'Access token required', status: 401, user: null };
  }
  return { error: null, status: 200, user };
}

export function requireAdmin(request) {
  const { error, status, user } = requireAuth(request);
  if (error) return { error, status, user: null };
  if (user.role !== 'admin') {
    return { error: 'Admin access required', status: 403, user: null };
  }
  return { error: null, status: 200, user };
}
