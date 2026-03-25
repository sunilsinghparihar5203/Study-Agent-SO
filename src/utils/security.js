// Security utilities for input validation and sanitization

export const sanitizeEmail = (email) => {
  if (!email || typeof email !== 'string') return '';
  
  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new Error('Invalid email format');
  }
  
  // Sanitize email
  return email.toLowerCase().trim();
};

export const validatePassword = (password) => {
  if (!password || typeof password !== 'string') {
    throw new Error('Password is required');
  }
  
  if (password.length < 6) {
    throw new Error('Password must be at least 6 characters long');
  }
  
  if (password.length > 128) {
    throw new Error('Password is too long');
  }
  
  // Check for common weak passwords
  const weakPasswords = ['password', '123456', 'qwerty', 'abc123'];
  if (weakPasswords.includes(password.toLowerCase())) {
    throw new Error('Please choose a stronger password');
  }
  
  return true;
};

export const sanitizeString = (str, maxLength = 100) => {
  if (!str || typeof str !== 'string') return '';
  
  // Remove potentially dangerous characters
  const sanitized = str
    .replace(/[<>]/g, '') // Remove HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .trim();
  
  // Limit length
  return sanitized.substring(0, maxLength);
};

export const validateUserId = (userId) => {
  if (!userId || typeof userId !== 'string') {
    throw new Error('Invalid user ID');
  }
  
  // Firebase user IDs are typically 28 characters alphanumeric
  if (userId.length < 20 || userId.length > 50) {
    throw new Error('Invalid user ID format');
  }
  
  // Only allow alphanumeric and some special characters
  const userIdRegex = /^[a-zA-Z0-9_-]+$/;
  if (!userIdRegex.test(userId)) {
    throw new Error('Invalid user ID characters');
  }
  
  return true;
};

export const rateLimit = {
  attempts: new Map(),
  
  check: (identifier, maxAttempts = 5, windowMs = 900000) => { // 15 minutes
    const now = Date.now();
    const attempts = rateLimit.attempts.get(identifier) || [];
    
    // Remove old attempts outside the window
    const validAttempts = attempts.filter(time => now - time < windowMs);
    
    if (validAttempts.length >= maxAttempts) {
      throw new Error('Too many attempts. Please try again later.');
    }
    
    // Add current attempt
    validAttempts.push(now);
    rateLimit.attempts.set(identifier, validAttempts);
    
    return true;
  },
  
  clear: (identifier) => {
    rateLimit.attempts.delete(identifier);
  }
};

export const generateSecureToken = () => {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};
