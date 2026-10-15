import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure data directory exists
const DATA_DIR = path.resolve(__dirname, '..', 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const USERS_FILE = path.join(DATA_DIR, 'users.json');
const SESSIONS_FILE = path.join(DATA_DIR, 'sessions.json');
const RESETS_FILE = path.join(DATA_DIR, 'password-resets.json');

export interface StoredUser {
  id: string; // uid
  email: string; // normalized lowercase
  displayName: string;
  salt: string; // hex
  passwordHash: string; // scrypt hex
  createdAt: string;
  lastLogin?: string;
}

export interface UserSession {
  token: string;
  userId: string;
  createdAt: number;
  expiresAt: number;
}

export interface PasswordResetRecord {
  token: string;
  email: string;
  createdAt: number;
  expiresAt: number;
}

// 7 days session lifetime
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;
// 1 hour reset token lifetime
const RESET_TTL_MS = 60 * 60 * 1000;

function readJsonFile<T>(filePath: string, defaultValue: T): T {
  try {
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify(defaultValue, null, 2), 'utf-8');
      return defaultValue;
    }
    const raw = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(raw) as T;
  } catch (err) {
    console.error(`Error reading ${filePath}:`, err);
    return defaultValue;
  }
}

function writeJsonFile<T>(filePath: string, data: T): void {
  try {
    const tempPath = `${filePath}.tmp.${Date.now()}`;
    fs.writeFileSync(tempPath, JSON.stringify(data, null, 2), 'utf-8');
    fs.renameSync(tempPath, filePath);
  } catch (err) {
    console.error(`Error writing to ${filePath}:`, err);
  }
}

// Cryptographic helpers
function hashPassword(password: string, salt: string): string {
  const derivedKey = crypto.scryptSync(password, salt, 64);
  return derivedKey.toString('hex');
}

function verifyPassword(password: string, salt: string, storedHash: string): boolean {
  try {
    const derivedKey = crypto.scryptSync(password, salt, 64);
    const storedBuf = Buffer.from(storedHash, 'hex');
    if (derivedKey.length !== storedBuf.length) {
      return false;
    }
    return crypto.timingSafeEqual(derivedKey, storedBuf);
  } catch {
    return false;
  }
}

export class AuthService {
  private static getUsers(): Record<string, StoredUser> {
    return readJsonFile<Record<string, StoredUser>>(USERS_FILE, {});
  }

  private static saveUsers(users: Record<string, StoredUser>): void {
    writeJsonFile(USERS_FILE, users);
  }

  private static getSessions(): Record<string, UserSession> {
    return readJsonFile<Record<string, UserSession>>(SESSIONS_FILE, {});
  }

  private static saveSessions(sessions: Record<string, UserSession>): void {
    writeJsonFile(SESSIONS_FILE, sessions);
  }

  private static getResets(): Record<string, PasswordResetRecord> {
    return readJsonFile<Record<string, PasswordResetRecord>>(RESETS_FILE, {});
  }

  private static saveResets(resets: Record<string, PasswordResetRecord>): void {
    writeJsonFile(RESETS_FILE, resets);
  }

  /**
   * Register a new user
   */
  static register(data: {
    fullName: string;
    email: string;
    password: string;
  }): { user: { uid: string; email: string; displayName: string }; token: string } {
    const normalizedEmail = (data.email || '').trim().toLowerCase();
    const normalizedName = (data.fullName || '').trim();
    const password = data.password || '';

    // Validation
    if (!normalizedName || normalizedName.length < 2) {
      throw { status: 400, message: 'Please provide your full name (minimum 2 characters).' };
    }

    if (!normalizedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      throw { status: 400, message: 'Please provide a valid email address.' };
    }

    if (!password || password.length < 6) {
      throw { status: 400, message: 'Password must be at least 6 characters long.' };
    }

    const users = this.getUsers();

    // Check duplicate email
    const emailExists = Object.values(users).some(
      (u) => u.email.toLowerCase() === normalizedEmail
    );
    if (emailExists) {
      throw {
        status: 409,
        message: 'An account with this email address already exists. Please sign in instead.',
      };
    }

    // Generate user ID & Salt
    const uid = 'usr_' + crypto.randomBytes(12).toString('hex');
    const salt = crypto.randomBytes(32).toString('hex');
    const passwordHash = hashPassword(password, salt);
    const now = new Date().toISOString();

    const newUser: StoredUser = {
      id: uid,
      email: normalizedEmail,
      displayName: normalizedName,
      salt,
      passwordHash,
      createdAt: now,
      lastLogin: now,
    };

    users[uid] = newUser;
    this.saveUsers(users);

    // Create active session
    const sessionToken = this.createSession(uid);

    return {
      user: {
        uid: newUser.id,
        email: newUser.email,
        displayName: newUser.displayName,
      },
      token: sessionToken,
    };
  }

  /**
   * Authenticate an existing user
   */
  static login(data: {
    email: string;
    password: string;
  }): { user: { uid: string; email: string; displayName: string }; token: string } {
    const normalizedEmail = (data.email || '').trim().toLowerCase();
    const password = data.password || '';

    if (!normalizedEmail || !password) {
      throw { status: 400, message: 'Please enter both your email address and password.' };
    }

    const users = this.getUsers();
    const user = Object.values(users).find(
      (u) => u.email.toLowerCase() === normalizedEmail
    );

    if (!user) {
      throw { status: 401, message: 'Invalid email or password combination. Please try again.' };
    }

    const isValid = verifyPassword(password, user.salt, user.passwordHash);
    if (!isValid) {
      throw { status: 401, message: 'Invalid email or password combination. Please try again.' };
    }

    // Update last login
    user.lastLogin = new Date().toISOString();
    users[user.id] = user;
    this.saveUsers(users);

    // Create active session
    const sessionToken = this.createSession(user.id);

    return {
      user: {
        uid: user.id,
        email: user.email,
        displayName: user.displayName,
      },
      token: sessionToken,
    };
  }

  /**
   * Create cryptographically secure session
   */
  private static createSession(userId: string): string {
    const token = crypto.randomBytes(32).toString('hex');
    const now = Date.now();
    const session: UserSession = {
      token,
      userId,
      createdAt: now,
      expiresAt: now + SESSION_TTL_MS,
    };

    const sessions = this.getSessions();
    // Clean up expired sessions periodically
    const activeSessions: Record<string, UserSession> = {};
    for (const [key, sess] of Object.entries(sessions)) {
      if (sess.expiresAt > now) {
        activeSessions[key] = sess;
      }
    }

    activeSessions[token] = session;
    this.saveSessions(activeSessions);
    return token;
  }

  /**
   * Verify session token and retrieve user
   */
  static getUserByToken(token: string): { uid: string; email: string; displayName: string } | null {
    if (!token) return null;

    const sessions = this.getSessions();
    const session = sessions[token];
    if (!session) return null;

    if (Date.now() > session.expiresAt) {
      delete sessions[token];
      this.saveSessions(sessions);
      return null;
    }

    const users = this.getUsers();
    const user = users[session.userId];
    if (!user) return null;

    return {
      uid: user.id,
      email: user.email,
      displayName: user.displayName,
    };
  }

  /**
   * Terminate session on logout
   */
  static logout(token: string): void {
    if (!token) return;
    const sessions = this.getSessions();
    if (sessions[token]) {
      delete sessions[token];
      this.saveSessions(sessions);
    }
  }

  /**
   * Create password reset request
   */
  static requestPasswordReset(email: string): { message: string } {
    const normalizedEmail = (email || '').trim().toLowerCase();
    if (!normalizedEmail || !normalizedEmail.includes('@')) {
      throw { status: 400, message: 'Please enter a valid email address format.' };
    }

    const users = this.getUsers();
    const user = Object.values(users).find(
      (u) => u.email.toLowerCase() === normalizedEmail
    );

    // If user exists, create reset token
    if (user) {
      const resetToken = crypto.randomBytes(24).toString('hex');
      const now = Date.now();
      const resets = this.getResets();
      resets[resetToken] = {
        token: resetToken,
        email: normalizedEmail,
        createdAt: now,
        expiresAt: now + RESET_TTL_MS,
      };
      this.saveResets(resets);
    }

    // Always return safe success message to prevent user enumeration
    return {
      message: 'If an account exists with this email address, a password reset link has been dispatched to your inbox.',
    };
  }
}
