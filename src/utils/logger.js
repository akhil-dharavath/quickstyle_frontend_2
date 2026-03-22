// Set this to false in production to disable verbose logging, or rely on VITE_ENV
const ENABLE_LOGGING = import.meta.env.VITE_ENABLE_LOGS !== 'false';

export const logger = {
  info: (message, ...data) => {
    if (ENABLE_LOGGING) {
      console.log(`[INFO] ${message}`, ...data);
    }
  },
  warn: (message, ...data) => {
    if (ENABLE_LOGGING) {
      console.warn(`[WARN] ${message}`, ...data);
    }
  },
  error: (message, ...data) => {
    // We usually always want to log errors, even in prod, but you can restrict it here too.
    console.error(`[ERROR] ${message}`, ...data);
  },
  debug: (message, ...data) => {
    if (ENABLE_LOGGING && import.meta.env.DEV) {
      console.debug(`[DEBUG] ${message}`, ...data);
    }
  },
};
