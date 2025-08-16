import 'dotenv/config';
import app from './app.js';
import { AppDataSource } from './config/database.js';

async function main() {
    try {
        // Conectar a la base de datos
        await AppDataSource.initialize();
        console.log('✅ Base de datos conectada exitosamente');

        // Obtener puerto de las variables de entorno o usar 3000 por defecto
        const PORT = process.env.PORT || 3000;
        const HOST = process.env.HOST || 'localhost';

        // Iniciar servidor
        app.listen(PORT, () => {
            console.log('\n🚀 Servidor AlquiNet iniciado exitosamente!');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log(`📍 URL del servidor: http://${HOST}:${PORT}`);
            console.log(`📚 Documentación API: http://${HOST}:${PORT}/api-docs`);
            console.log(`🌐 Ambiente: ${process.env.NODE_ENV || 'development'}`);
            console.log(`📊 Base de datos: ${process.env.DB_NAME} (${process.env.DB_HOST}:${process.env.DB_PORT})`);
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('📚 Endpoints disponibles:');
            console.log(`   • POST http://${HOST}:${PORT}/auth/register - Registrar usuario`);
            console.log(`   • POST http://${HOST}:${PORT}/auth/login - Iniciar sesión`);
            console.log(`   • GET  http://${HOST}:${PORT}/users - Listar usuarios`);
            console.log(`   • GET  http://${HOST}:${PORT}/api/propiedades - Listar propiedades`);
            console.log(`   • GET  http://${HOST}:${PORT}/api/reservas - Listar reservas`);
            console.log(`   • GET  http://${HOST}:${PORT}/api/resenias - Listar reseñas`);
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('🛠️  Presiona Ctrl+C para detener el servidor\n');
        });
    } catch (error) {
        if (error instanceof Error) {
            console.error('❌ Error al iniciar el servidor:', error.message);
            console.error('📍 Stack trace:', error.stack);
        }
        process.exit(1);
    }
}

main();