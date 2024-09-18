import { ClassSerializerInterceptor, ConsoleLogger, Module} from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { PostgresConfigService } from "./config/postgres.config.service";
import { UserModule } from "./modules/user/user.module";
import { ServiceOrderModule } from './modules/service-order/service-order.module';
import { AuthenticationModule } from "./modules/auth/authentication.module";
import { RedirectController } from "./redirect.controller";
import { FilterGlobalException } from "./resources/filters/filter-global-exception";
import { APP_FILTER, APP_INTERCEPTOR } from "@nestjs/core";
import { SeederModule } from "./db/seeds/seeder.module";
import { LoggerGlobalInterceptor } from "./resources/interceptors/logger-global-interceptors";
@Module({
  imports: [
    UserModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      useClass: PostgresConfigService,
      inject: [PostgresConfigService],
    }),
    AuthenticationModule,
    ServiceOrderModule,
    SeederModule,
    RolesModule,
  ],
  controllers: [RedirectController],
  providers: [
    {
      provide: APP_FILTER,
      useClass: FilterGlobalException,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ClassSerializerInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggerGlobalInterceptor,
    },
    ConsoleLogger,
  ],
})
export class AppModule {}
