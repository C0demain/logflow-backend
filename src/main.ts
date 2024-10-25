import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { useContainer } from "class-validator";
import { AppModule } from "./app.module";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { SeederService } from "./db/seeds/seeder.service";
import * as fs from 'fs'; 

async function bootstrap() {

  const httpsOptions = {
    key: fs.readFileSync('./src/cert/key.pem'),
    cert: fs.readFileSync('./src/cert/cert.pem'),
  };

  const app = await NestFactory.create(
    AppModule, 
    { httpsOptions }
  );

  const seeder = app.get(SeederService);
  try {
    await seeder.run();
  } catch (error) {
    console.error('Erro ao rodar os seeders:', error);
    process.exit(1);
  }
  
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.enableCors({
    origin: "http://localhost:3000",
  });

  const config = new DocumentBuilder()
    .setTitle("LogFlow API")
    .setDescription("LogFlow Documentation")
    .setVersion("1.0")
    .addTag("users")
    .addTag("service-order")
    .addServer("https://localhost:8000", "Development Server")
    .addBearerAuth()
    .setLicense("MIT License", "https://opensource.org/licenses/MIT")
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api", app, document);

  useContainer(app.select(AppModule), { fallbackOnErrors: true });
  await app.listen(8000);
}
bootstrap();