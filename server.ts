import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { analyzeWithGemini } from './server/analyzer/aiAnalyzer.ts';
import { fetchThreatIntelligence } from './server/feedService.ts';
import { AuthService } from './server/authService.ts';
import type { AnalysisRequest } from './src/types/cyber.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// AI Studio requirement: The app server must run on port 3000.
// In Cloud Run containers, Nginx binds to 8080 and reverse-proxies to 3000.
// If process.env.PORT is 8080, binding to it causes an EADDRINUSE crash with Nginx.
function getPort(): number {
  const portArgIndex = process.argv.indexOf('--port');
  if (portArgIndex !== -1 && process.argv[portArgIndex + 1]) {
    const parsed = parseInt(process.argv[portArgIndex + 1], 10);
    if (!isNaN(parsed) && parsed !== 8080) return parsed;
  }
  if (process.env.PORT && process.env.PORT !== '8080') {
    const parsed = parseInt(process.env.PORT, 10);
    if (!isNaN(parsed)) return parsed;
  }
  return 3000;
}

const PORT = getPort();

// Security headers and API endpoint configuration
app.use('/api', (req: Request, res: Response, next: NextFunction) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');

  // Handle CORS preflight requests safely
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return res.status(204).end();
  }
  next();
});

// JSON body parser with explicit JSON error interception
app.use(express.json({ limit: '500kb' }));

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'Cyber Kawach Backend',
    version: '1.0.0',
    gemini_configured: Boolean(process.env.GEMINI_API_KEY),
    timestamp: new Date().toISOString(),
  });
});

// ==========================================
// AUTHENTICATION ENDPOINTS
// ==========================================

// Register new user account
app.post('/api/auth/register', (req: Request, res: Response) => {
  try {
    const { fullName, email, password, confirmPassword } = req.body || {};

    if (confirmPassword !== undefined && password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        error: 'Password confirmation does not match.',
      });
    }

    const result = AuthService.register({ fullName, email, password });
    return res.status(201).json({
      success: true,
      message: 'Account registered successfully.',
      user: result.user,
      token: result.token,
    });
  } catch (err: any) {
    const status = err.status || 500;
    const message = err.message || 'An unexpected error occurred during registration. Please try again.';
    return res.status(status).json({
      success: false,
      error: message,
    });
  }
});

// Login existing user
app.post('/api/auth/login', (req: Request, res: Response) => {
  try {
    const { email, password } = req.body || {};
    const result = AuthService.login({ email, password });
    return res.json({
      success: true,
      message: 'Login successful.',
      user: result.user,
      token: result.token,
    });
  } catch (err: any) {
    const status = err.status || 500;
    const message = err.message || 'An unexpected error occurred during login. Please try again.';
    return res.status(status).json({
      success: false,
      error: message,
    });
  }
});

// Verify session token / fetch current user
app.get('/api/auth/me', (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'No authorization token provided.',
      });
    }

    const token = authHeader.substring(7).trim();
    const user = AuthService.getUserByToken(token);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Session expired or invalid token. Please log in again.',
      });
    }

    return res.json({
      success: true,
      user,
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: 'Failed to verify authentication token.',
    });
  }
});

// Logout endpoint
app.post('/api/auth/logout', (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7).trim();
      AuthService.logout(token);
    }
    return res.json({
      success: true,
      message: 'Logged out successfully.',
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: 'Logout encountered an issue.',
    });
  }
});

// Password reset request endpoint
app.post('/api/auth/reset-password', (req: Request, res: Response) => {
  try {
    const { email } = req.body || {};
    const result = AuthService.requestPasswordReset(email);
    return res.json({
      success: true,
      message: result.message,
    });
  } catch (err: any) {
    const status = err.status || 500;
    return res.status(status).json({
      success: false,
      error: err.message || 'Failed to process password reset request.',
    });
  }
});

// Authentication service status
app.get('/api/auth/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    auth_service: 'Cyber Kawach Secure Credential Engine',
    timestamp: new Date().toISOString(),
  });
});

// Threat intelligence live feed endpoint
app.get('/api/threat-intelligence', async (req: Request, res: Response) => {
  try {
    const data = await fetchThreatIntelligence();
    res.json(data);
  } catch (error: any) {
    console.error('Error fetching threat intelligence:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve threat intelligence feed. Please try again later.',
    });
  }
});

// Master analysis endpoint
app.post('/api/analyze', async (req: Request, res: Response) => {
  try {
    const { type, content, subject, sender } = req.body;

    if (!type || typeof type !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Missing or invalid "type" parameter. Must be one of: email, whatsapp, sms, url',
      });
    }

    const validTypes = ['email', 'whatsapp', 'sms', 'url'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        error: `Unsupported content type "${type}". Allowed types: ${validTypes.join(', ')}`,
      });
    }

    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Content cannot be empty. Please provide text or a URL to analyze.',
      });
    }

    if (content.length > 10000) {
      return res.status(400).json({
        success: false,
        error: 'Content exceeds the maximum supported length of 10,000 characters.',
      });
    }

    const safeSubject = typeof subject === 'string' ? subject.trim().substring(0, 500) : undefined;
    const safeSender = typeof sender === 'string' ? sender.trim().substring(0, 300) : undefined;

    const requestPayload: AnalysisRequest = {
      type: type as any,
      content: content.trim(),
      subject: safeSubject,
      sender: safeSender,
    };

    const result = await analyzeWithGemini(requestPayload);
    return res.json(result);
  } catch (error: any) {
    console.error('Analysis error in /api/analyze:', error);
    return res.status(500).json({
      success: false,
      error: 'An internal error occurred during security analysis. Please try again.',
    });
  }
});

// JSON fallback for any unhandled /api route so it never leaks HTML to the client
app.all('/api/*', (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: `API endpoint not found: ${req.method} ${req.originalUrl}`,
  });
});

// Error handling middleware specifically for /api routes
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  if (req.originalUrl?.startsWith('/api') || req.path?.startsWith('/api')) {
    console.error('Unhandled API exception caught:', err);
    return res.status(err.status || 500).json({
      success: false,
      error: 'An unexpected internal server error occurred.',
    });
  }
  next(err);
});

// Setup Vite or static serving
async function setupServer() {
  const distPath = path.resolve(__dirname, 'dist');
  const distIndexHtml = path.resolve(distPath, 'index.html');
  const hasDist = fs.existsSync(distIndexHtml);
  const isProduction = process.env.NODE_ENV === 'production' || (hasDist && process.env.NODE_ENV !== 'development');

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(distIndexHtml);
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🛡️ Cyber Kawach Server running on http://0.0.0.0:${PORT}`);
  });
}

setupServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
