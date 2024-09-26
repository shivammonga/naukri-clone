import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ValidationPipe } from "@nestjs/common";
import { MongoExceptionFilter } from "./utils/filters/mongo-exception.filter";
import helmet from "helmet";
import compression from "compression";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: {
      origin: ["http://localhost:3000/"], // Replace with your allowed origins
      methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
      credentials: true,
    },
  });
  app.use(helmet());
  app.use(
    compression({
      level: 9,
      threshold: 0,
      filter: (req, res) => {
        if (req.headers["x-no-compression"]) {
          return false;
        }
        return compression.filter(req, res);
      },
    }),
  );
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true, errorHttpStatusCode: 422 }));
  app.useGlobalFilters(new MongoExceptionFilter());
  await app.listen(process.env.PORT ? parseInt(process.env.PORT) : 3000);
}
bootstrap();
