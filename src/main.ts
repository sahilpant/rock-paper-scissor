import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import 'dotenv/config';
import { ConfigService } from '@nestjs/config';
// import { RedisIoAdapter } from './redisIoadapter';
import { DocumentBuilder,SwaggerModule } from '@nestjs/swagger';

declare const module: any;


async function bootstrap() {


 
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('app');
  const options = new DocumentBuilder().setTitle('Roshambo Api').setDescription('Rock Paper Scissor').setVersion('1.0.0').build();
  const  document = SwaggerModule.createDocument(app,options);
  SwaggerModule.setup('app',app,document);
 
  // app.useWebSocketAdapter(new RedisIoAdapter(app));
 
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