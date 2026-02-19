
import { LocalFileProvider } from '../src/shared/files/storage/local-storage.provider';
import * as path from 'path';

async function run() {
    console.log('Starting debug script...');
    console.log(`Current working directory: ${process.cwd()}`);

    try {
        const provider = new LocalFileProvider();
        console.log('Provider instantiated.');

        provider.onModuleInit();
        console.log('onModuleInit called.');

    } catch (error) {
        console.error('An error occurred:', error);
    }
}

run();
