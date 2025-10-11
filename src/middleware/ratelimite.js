// rateLimit.js
import rateLimit from 'express-rate-limit';

// e.g. max 100 requests per 15 minutes per IP
const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,   
  max: 5000,           
  message: {
    success: false,
    error: 'Too many requests, please try again later.'
  },
  standardHeaders: true,      
  legacyHeaders: false,       
});

export default apiLimiter;
