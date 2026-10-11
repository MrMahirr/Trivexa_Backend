import { ConfigService } from '@nestjs/config';
import { LocalFileProvider } from '../src/shared/files/storage/local-storage.provider';

async function run() {
  console.log('Starting debug script...');
  console.log(`Current working directory: ${process.cwd()}`);

  try {
    const configService = new ConfigService({
      storage: { local: { uploadDir: './uploads' } },
    });
    const provider = new LocalFileProvider(configService);
    console.log('Provider instantiated.');

    provider.onModuleInit();
    console.log('onModuleInit called.');
  } catch (error) {
    console.error('An error occurred:', error);
  }
}

run();
