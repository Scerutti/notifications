import Redis from 'ioredis';

export const redisClient = new Redis({
  host: process.env.REDIS_HOST || 'redis',
  port: Number(process.env.REDIS_PORT || 6379),
  username: process.env.REDIS_USERNAME || undefined,
  password: process.env.REDIS_PASSWORD || undefined,
});

redisClient.on('connect', () => {
  console.log('🔌 Redis TCP conectado');
});

redisClient.on('ready', async () => {
  console.log('✅ Redis listo (autenticación y comandos OK)');
  try {
    const pong = await redisClient.ping();
    console.log('📡 Respuesta PING:', pong);
  } catch (err) {
    console.error('❌ Error en PING Redis:', err);
  }
});

redisClient.on('error', (err) => {
  console.error('Redis Client Error', err);
});
