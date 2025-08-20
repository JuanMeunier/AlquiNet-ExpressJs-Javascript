import 'dotenv/config';
import app from './app.js';
import { AppDataSource } from './config/database.js';
import { isRedisConnected } from './config/reddis.js';
import logger from './config/logger.js';

async function main() {
    try {
        logger.info('Iniciando servidor AlquiNet...');

        // Conectar a la base de datos
        logger.info('Conectando a la base de datos...');
        await AppDataSource.initialize();
        logger.success('Base de datos conectada exitosamente');

        // Conectar a Redis
        logger.info('Conectando a Redis...');
        await isRedisConnected();
        logger.success('Redis conectado correctamente');

        // Configurar servidor
        const PORT = process.env.PORT || 3000;
        const HOST = process.env.HOST || 'localhost';

        // Iniciar servidor
        app.listen(PORT, () => {
            logger.success('🚀 Servidor AlquiNet iniciado exitosamente!');
            logger.info(`📍 URL: http://${HOST}:${PORT}`);
            logger.info(`📚 Documentación: http://${HOST}:${PORT}/api-docs`);
            logger.info(`🌐 Ambiente: ${process.env.NODE_ENV || 'development'}`);
        });

    } catch (error) {
        logger.error('Error al iniciar el servidor', error);
        process.exit(1);
    }
}

main();