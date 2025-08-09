import 'dotenv/config';
import app from './app.js';
import { AppDataSource } from './config/database.js';


async function main() {
    try {
        await AppDataSource.initialize();
        console.log('Base de datos Conectada')
        app.listen(process.env.PORT, () => {
            console.log('Server is running on port ', process.env.PORT);
        });
    } catch (error) {
        if (error instanceof Error) {
            console.log(error.message)
        }

    }
}

main();