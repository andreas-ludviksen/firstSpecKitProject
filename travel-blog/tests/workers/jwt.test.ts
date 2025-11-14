/**
 * Unit tests for JWT token generation and verification
 */

import { generateToken, verifyToken, extractTokenFromCookie } from '../../workers/lib/jwt';
import * as jwt from 'jsonwebtoken';

describe('JWT Utilities', () => {
  const testSecret = 'test-secret-key-for-jwt';
  const testUsername = 'testuser';
  const testRole = 'reader' as const;
  
  describe('generateToken', () => {
    it('should generate valid JWT token with remember me', () => {
      const token = generateToken(testUsername, testRole, true, testSecret);
      
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // JWT has 3 parts
    });
    
    it('should generate valid JWT token without remember me', () => {
      const token = generateToken(testUsername, testRole, false, testSecret);
      
      expect(token).toBeDefined();
      expect(token.split('.')).toHaveLength(3);
    });
    
    it('should include correct claims in token', () => {
      const token = generateToken(testUsername, testRole, true, testSecret);
      const payload = verifyToken(token, testSecret);
      
      expect(payload).not.toBeNull();
      expect(payload?.sub).toBe(testUsername);
      expect(payload?.role).toBe(testRole);
      expect(payload?.rememberMe).toBe(true);
      expect(payload?.iat).toBeDefined();
      expect(payload?.exp).toBeDefined();
    });
    
    it('should set 7-day expiry for remember me', () => {
      const token = generateToken(testUsername, testRole, true, testSecret);
      const payload = verifyToken(token, testSecret);
      
      expect(payload).not.toBeNull();
      if (payload) {
        const duration = payload.exp - payload.iat;
        const sevenDays = 7 * 24 * 60 * 60;
        
        expect(duration).toBe(sevenDays);
      }
    });
    
    it('should set 24-hour expiry without remember me', () => {
      const token = generateToken(testUsername, testRole, false, testSecret);
      const payload = verifyToken(token, testSecret);
      
      expect(payload).not.toBeNull();
      if (payload) {
        const duration = payload.exp - payload.iat;
        const twentyFourHours = 24 * 60 * 60;
        
        expect(duration).toBe(twentyFourHours);
      }
    });
  });
  
  describe('verifyToken', () => {
    it('should verify valid token', () => {
      const token = generateToken(testUsername, testRole, true, testSecret);
      const payload = verifyToken(token, testSecret);
      
      expect(payload).not.toBeNull();
      expect(payload?.sub).toBe(testUsername);
    });
    
    it('should reject token with wrong secret', () => {
      const token = generateToken(testUsername, testRole, true, testSecret);
      const payload = verifyToken(token, 'wrong-secret');
      
      expect(payload).toBeNull();
    });
    
    it('should reject malformed token', () => {
      const payload = verifyToken('not.a.valid.jwt', testSecret);
      
      expect(payload).toBeNull();
    });
    
    it('should reject expired token', () => {
      // Create token that expired 1 second ago
      const now = Math.floor(Date.now() / 1000);
      const expiredPayload = {
        sub: testUsername,
        role: testRole,
        iat: now - 100,
        exp: now - 1,
        rememberMe: false,
      };
      
      // Manually create expired token for testing
      const expiredToken = jwt.sign(expiredPayload, testSecret, { algorithm: 'HS256' });
      
      const payload = verifyToken(expiredToken, testSecret);
      
      expect(payload).toBeNull();
    });
  });
  
  describe('extractTokenFromCookie', () => {
    it('should extract token from cookie header', () => {
      const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test.token';
      const cookieHeader = `session=${token}`;
      
      const extracted = extractTokenFromCookie(cookieHeader);
      
      expect(extracted).toBe(token);
    });
    
    it('should extract token from cookie with multiple cookies', () => {
      const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test.token';
      const cookieHeader = `other=value; session=${token}; another=value2`;
      
      const extracted = extractTokenFromCookie(cookieHeader);
      
      expect(extracted).toBe(token);
    });
    
    it('should return null if session cookie not found', () => {
      const cookieHeader = 'other=value; another=value2';
      
      const extracted = extractTokenFromCookie(cookieHeader);
      
      expect(extracted).toBeNull();
    });
    
    it('should return null if cookie header is null', () => {
      const extracted = extractTokenFromCookie(null);
      
      expect(extracted).toBeNull();
    });
    
    it('should support custom cookie name', () => {
      const token = 'test.token.here';
      const cookieHeader = `customSession=${token}`;
      
      const extracted = extractTokenFromCookie(cookieHeader, 'customSession');
      
      expect(extracted).toBe(token);
    });
  });
});
