import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { FastifyAdapter, NestFastifyApplication } from "@nestjs/platform-fastify";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import { AppModule } from "./app.module";
import { contentParser } from "../fastify-file-interceptor/src";

export async function createApp(): Promise<NestFastifyApplication> {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter()
  );


  await app.register(contentParser, {});

  const config = new DocumentBuilder()
    .setTitle("Fastify File Interceptor Example")
    .setDescription("Demo of Fastify file upload interceptors with Swagger")
    .setVersion("1.0")
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api", app, document);
  return app;
}
