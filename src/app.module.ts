import { Module} from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { PostgresConfigService } from "./config/postgres.config.service";
import { UserModule } from "./modules/user/user.module";
import { ServiceOrderModule } from './modules/service-order/service-order.module';
import { AuthenticationModule } from "./modules/auth/authentication.module";

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
  ],
  controllers: [],
  providers: [],
})

export class AppModule {}