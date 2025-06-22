import Redis from "ioredis";

// 连接本地Redis，生产环境可用process.env.REDIS_URL等
const redis = new Redis({
  host: process.env.REDIS_HOST || "127.0.0.1",
  port: process.env.REDIS_PORT ? Number(process.env.REDIS_PORT) : 6379,
});

export default redis;
