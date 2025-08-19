import { createClient } from 'redis';
import dotenv from 'dotenv';

dotenv.config();

export const client = createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379', // URL por defecto para Docker local
});

client.on('error', (err) => console.error('❌ Redis Error:', err));
client.on('connect', () => console.log('🔄 Conectando a Redis...'));
client.on('ready', () => console.log('✅ Redis conectado y listo'));

export async function isRedisConnected() {
    try {
        await client.connect();
        console.log('📦 Redis conectado exitosamente');

        // Prueba de escritura/lectura
        await client.set('saludo', 'Hola desde Redis Docker');
        const value = await client.get('saludo');
        console.log('📌 Valor desde Redis:', value);

    } catch (error) {
        console.error('❌ Error conectando Redis:', error.message);
    }
}
