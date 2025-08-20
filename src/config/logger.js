// src/config/logger.js
import fs from 'fs';
import path from 'path';

// Crear carpeta logs si no existe
const logsDir = './logs';
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir);
}

// Función para obtener fecha actual
function getDate() {
    const now = new Date();
    return now.toLocaleString('es-AR');
}

// Función para escribir en archivo
function writeLog(message) {
    const date = new Date().toISOString().split('T')[0]; // 2025-08-20
    const logFile = path.join(logsDir, `app-${date}.log`);
    const logMessage = `${message}\n`;

    fs.appendFileSync(logFile, logMessage);
}

// Logger simple
const logger = {
    // Información general
    info: (message) => {
        const log = `[${getDate()}] ℹ️ ${message}`;
        console.log(log);
        writeLog(log);
    },

    // Errores
    error: (message, error = null) => {
        const log = `[${getDate()}] ❌ ${message}`;
        console.error(log);
        writeLog(log);

        if (error) {
            const errorLog = `[${getDate()}] ❌ Error: ${error.message}`;
            console.error(errorLog);
            writeLog(errorLog);
        }
    },

    // Éxito
    success: (message) => {
        const log = `[${getDate()}] ✅ ${message}`;
        console.log(log);
        writeLog(log);
    },

    // Advertencias
    warn: (message) => {
        const log = `[${getDate()}] ⚠️ ${message}`;
        console.warn(log);
        writeLog(log);
    }
};

export default logger;