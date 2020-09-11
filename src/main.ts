import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import 'dotenv/config';
import { ConfigService } from '@nestjs/config';
import { RedisIoAdapter } from './redisIoadapter';

declare const module: any;


async function bootstrap() {


  const app = await NestFactory.create(AppModule);
  app.useWebSocketAdapter(new RedisIoAdapter(app));
  console.log((process.env.NODE_ENV))

  var configServcie = app.get(ConfigService)

  const port = parseInt(configServcie.get('database.port'))
  
  console.log(configServcie.get('database.port'))
  await app.listen(port);

  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }
}
bootstrap();