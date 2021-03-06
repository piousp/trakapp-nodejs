const db = "mongodb://localhost:29531/rastreador";

export default {
  TOKEN_SECRET: process.env.TOKEN_SECRET || "Sunlight Yellow Overdrive",
  MONGO_URI: process.env.MONGO_URI || db,
  PUERTO: process.env.PUERTO || 3001,
  ORIGIN: process.env.ORIGIN || "http://localhost:3000",
  PRODUCCION: process.env.NODE_ENV === "production" || false,
  API_KEY: process.env.MAILGUN_API_KEY || "key-d49308b677d961109141b24ef95b6722",
  DOMAIN: process.env.MAILGUN_DOMAIN || "trakapp.ciriscr.com",
  ADMIN_URL: process.env.ADMIN_URL || "http://localhost:3000",
  BUGSNAG_STAGE: process.env.BUGSNAG_STAGE || "development",
};
