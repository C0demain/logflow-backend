import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { useContainer } from "class-validator";
import { AppModule } from "./app.module";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { SeederService } from "./db/seeds/seeder.service";
import { IoAdapter } from "@nestjs/platform-socket.io";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useWebSocketAdapter(new IoAdapter(app));
  console.log('WebSocket Server is running...');

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
    origin: "*",
  });

  const config = new DocumentBuilder()
    .setTitle("LogFlow API")
    .setDescription("LogFlow Documentation")
    .setVersion("1.0")
    .addTag("users")
    .addTag("service-order")
    .addServer("http://localhost:8000", "Development Server")
    .addBearerAuth()
    .setLicense("MIT License", "https://opensource.org/licenses/MIT")
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api", app, document);

  useContainer(app.select(AppModule), { fallbackOnErrors: true });
  await app.listen(8000);
}
bootstrap();