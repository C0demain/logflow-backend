import { Module} from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { PostgresConfigService } from "./config/postgres.config.service";
import { UserModule } from "./modules/user/user.module";
import { ServiceOrderModule } from './service-order/service-order.module';

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
    ServiceOrderModule,
  ],
  controllers: [],
  providers: [],
})

export class AppModule {}