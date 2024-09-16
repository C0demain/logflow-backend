import { ConsoleLogger, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostgresConfigService } from './config/postgres.config.service';
import { UserModule } from './modules/user/user.module';
import { ServiceOrderModule } from './modules/service-order/service-order.module';
import { AuthenticationModule } from './modules/auth/authentication.module';
import { RedirectController } from './redirect.controller';
import { FilterGlobalException } from './resources/filters/filter-global-exception';
import { APP_FILTER } from '@nestjs/core';
import { RolesModule } from './modules/roles/roles.module';

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
    RolesModule,
  ],
  controllers: [RedirectController],
  providers: [
    {
      provide: APP_FILTER,
      useClass: FilterGlobalException,
    },
    ConsoleLogger,
  ],
})
export class AppModule {}
