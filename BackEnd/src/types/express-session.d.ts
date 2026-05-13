// server/src/types/express-session.d.ts
// TypeScript declaration file to fix session typing issues

/**
 * Express Session Type Extensions
 * 
 * This file extends the Express session types to include our custom
 * session properties and fix TypeScript compatibility issues.
 */

import 'express-session';

declare module 'express-session' {
  interface SessionData {
    userId?: number;
    username?: string;
    email?: string;
    role?: string;
    userRole?: string;
    name?: string;
    position?: string;
    isActive?: boolean;
    loginTime?: Date;
    lastActivity?: Date;
    user?: {
      id: number;
      username: string;
      email: string;
      role: string;
      name?: string;
      position?: string;
      is_active: boolean;
    };
  }
}

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        username: string;
        email: string;
        role: string;
        is_active: boolean;
        name?: string;
        position?: string;
      };
    }
  }
}

/*
=== SESSION TYPES FIX INSTRUCTIONS ===

1. Create this file: server/src/types/express-session.d.ts

2. Add to your tsconfig.json:
   {
     "compilerOptions": {
       "typeRoots": ["./node_modules/@types", "./src/types"]
     }
   }

3. Import this in your main files if needed:
   /// <reference types="./types/express-session" />

This will resolve TypeScript errors related to:
- Session property typing conflicts
- Missing session properties
- Request interface extensions
- Express module augmentation issues
*/