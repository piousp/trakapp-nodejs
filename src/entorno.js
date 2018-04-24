const db = "mongodb://localhost:29531/rastreador";

export default {
  TOKEN_SECRET: process.env.TOKEN_SECRET || "Sunlight Yellow Overdrive",
  MONGO_URI: process.env.MONGO_URI || db,
  PUERTO: process.env.PUERTO || 3001,
  ORIGIN: process.env.ORIGIN || "http://localhost:3000",
  PRODUCCION: process.env.NODE_ENV === "production" || false,
};
