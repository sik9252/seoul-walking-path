import "reflect-metadata";
import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { AppModule } from "./app.module";
import { loadEnvFile } from "./common/load-env";

async function bootstrap() {
  loadEnvFile();
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: true,
    credentials: false,
  });

  app.setGlobalPrefix("api");
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle("서울걷길 API")
    .setDescription("서울걷길 MVP 백엔드 API 초안")
    .setVersion("0.1.0")
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("docs", app, document);

  const port = Number(process.env.PORT ?? "4000");
  const host = process.env.HOST ?? "0.0.0.0";
  await app.listen(port, host);
  console.log(`[backend] listening on http://localhost:${port}`);
  if (host === "0.0.0.0") {
    console.log("[backend] bound to 0.0.0.0 (LAN devices can connect via your Mac IP)");
  }
}

void bootstrap();
