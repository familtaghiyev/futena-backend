// Simple logger utility for production/development
const isDevelopment = process.env.NODE_ENV === 'development';

const logger = {
  log: (...args) => {
    if (isDevelopment) {
      console.log(...args);
    }
  },
  
  error: (...args) => {
    // Always log errors, even in production
    console.error(...args);
  },
  
  warn: (...args) => {
    // Always log warnings, even in production
    console.warn(...args);
  },
  
  info: (...args) => {
    if (isDevelopment) {
      console.log(...args);
    }
  },
  
  debug: (...args) => {
    if (isDevelopment) {
      console.log(...args);
    }
  }
};

module.exports = logger;

