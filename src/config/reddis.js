// src/config/redis.js
import { createClient } from 'redis';
import dotenv from 'dotenv';

dotenv.config();

// Crear el cliente de Redis
const client = createClient({
    // Configuración básica - Redis en localhost por defecto
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
});

// Manejar errores
client.on('error', (err) => {
    console.error('❌ Redis Error:', err);
});

// Cuando se conecta
client.on('connect', () => {
    console.log('🔄 Conectando a Redis...');
});

// Cuando está listo para usar
client.on('ready', () => {
    console.log('✅ Redis conectado y listo');
});

// Función para conectar Redis
async function connectRedis() {
    try {
        await client.connect();
        console.log('📦 Redis conectado exitosamente');
    } catch (error) {
        console.error('❌ Error conectando Redis:', error.message);
        console.log('⚠️ El sistema funcionará sin cache');
    }
}

// Función para verificar si Redis está disponible
function isRedisConnected() {
    return client.isReady;
}

// Exportar el cliente y las funciones
export { client, connectRedis, isRedisConnected };