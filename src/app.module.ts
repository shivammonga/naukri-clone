import { Module } from "@nestjs/common";
import { AuthModule } from "./auth/auth.module";
import { ConfigModule } from "@nestjs/config";
import { MongooseModule } from "@nestjs/mongoose";
import { UtilsModule } from "./utils/utils.module";
import { JobsModule } from './jobs/jobs.module';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      useFactory: () => ({
        uri: process.env.MONGODB_URI,
      }),
    }),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule,
    UtilsModule,
    JobsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
