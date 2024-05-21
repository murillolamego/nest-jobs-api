import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';

interface ExpressSwaggerCustomOptions {
  explorer?: boolean;
  swaggerOptions?: Record<string, any>;
  customCss?: string;
  customCssUrl?: string;
  customJs?: string;
  customfavIcon?: string;
  swaggerUrl?: string;
  customSiteTitle?: string;
  validatorUrl?: string;
  url?: string;
  urls?: Record<'url' | 'name', string>[];
}

const customStyle = `
.swagger-ui .topbar { display: none } 
.swagger-ui .information-container{background-color: #636C7A; max-width: 100%; padding: 40px 30px 20px} 
.swagger-ui .info {margin: 0} 
.swagger-ui .info .title{color: #F7F9FD}
.swagger-ui .btn {box-shadow: none}
.swagger-ui .btn.authorize {background-color: #636C7A; color: #F7F9FD; border-color: #636C7A}
.swagger-ui .btn.authorize svg{fill: #F7F9FD}
.swagger-ui .authorization__btn svg{fill: #636C7A}`;

const expressSwaggerCustomOptions: ExpressSwaggerCustomOptions = {
  swaggerOptions: {
    tagsSorter: 'alpha',
  },
  customCss: customStyle,
  customSiteTitle: 'Nest Jobs API',
};

declare const module: any;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  const config = new DocumentBuilder()
    .setTitle('Nest Jobs API')
    .setVersion('1.0.0')
    .addBearerAuth()
    .build();

  app.enableCors();
  //app.use(csurf());
  app.use(helmet());
  app.useGlobalPipes(new ValidationPipe());
  app.setGlobalPrefix('v1');

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup(
    '/documentation/v1',
    app,
    document,
    expressSwaggerCustomOptions,
  );

  const serverPort = configService.get<string>('SERVER_PORT');
  await app.listen(serverPort);

  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }

  console.log(`Server listening on port ${serverPort}`);
}
bootstrap();
