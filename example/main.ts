import { createApp } from "./app";

async function bootstrap() {
  const app = await createApp();
  await app.listen(3000, "0.0.0.0");
  console.log("Example server running at http://localhost:3000");
}

bootstrap().catch((err) => {
  console.error(err);
  process.exit(1);
});
