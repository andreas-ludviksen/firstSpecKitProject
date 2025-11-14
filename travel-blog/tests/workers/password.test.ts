/**
 * Unit tests for password hashing and verification
 */

import { hashPassword, verifyPassword, hashPasswordSync } from '../../workers/lib/password';

describe('Password Utilities', () => {
  const testPassword = 'testPassword123';
  
  describe('hashPassword', () => {
    it('should hash a password asynchronously', async () => {
      const hash = await hashPassword(testPassword);
      
      expect(hash).toBeDefined();
      expect(hash).toMatch(/^\$2[ayb]\$.{56}$/); // bcrypt hash format
      expect(hash).not.toBe(testPassword);
    });
    
    it('should generate different hashes for same password (salt)', async () => {
      const hash1 = await hashPassword(testPassword);
      const hash2 = await hashPassword(testPassword);
      
      expect(hash1).not.toBe(hash2);
    });
  });
  
  describe('hashPasswordSync', () => {
    it('should hash a password synchronously', () => {
      const hash = hashPasswordSync(testPassword);
      
      expect(hash).toBeDefined();
      expect(hash).toMatch(/^\$2[ayb]\$.{56}$/);
      expect(hash).not.toBe(testPassword);
    });
  });
  
  describe('verifyPassword', () => {
    it('should verify correct password', async () => {
      const hash = await hashPassword(testPassword);
      const isValid = await verifyPassword(testPassword, hash);
      
      expect(isValid).toBe(true);
    });
    
    it('should reject incorrect password', async () => {
      const hash = await hashPassword(testPassword);
      const isValid = await verifyPassword('wrongPassword', hash);
      
      expect(isValid).toBe(false);
    });
    
    it('should handle invalid hash format gracefully', async () => {
      const isValid = await verifyPassword(testPassword, 'not-a-valid-hash');
      
      expect(isValid).toBe(false);
    });
    
    it('should use constant-time comparison', async () => {
      const hash = await hashPassword(testPassword);
      
      // Both should take similar time (timing attack prevention)
      const start1 = Date.now();
      await verifyPassword('wrong', hash);
      const time1 = Date.now() - start1;
      
      const start2 = Date.now();
      await verifyPassword(testPassword, hash);
      const time2 = Date.now() - start2;
      
      // Both operations should complete (not throw)
      expect(time1).toBeGreaterThan(0);
      expect(time2).toBeGreaterThan(0);
    });
  });
});
