import {
  ConsoleLogger,
  Module,
} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostgresConfigService } from './config/postgres.config.service';
import { UserModule } from './modules/user/user.module';
import { ServiceOrderModule } from './modules/service-order/service-order.module';
import { AuthenticationModule } from './modules/auth/authentication.module';
import { RedirectController } from './redirect.controller';
import { FilterGlobalException } from './resources/filters/filter-global-exception';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { SeederModule } from './db/seeds/seeder.module';
import { LoggerGlobalInterceptor } from './resources/interceptors/logger-global-interceptors';
import { ClientModule } from './modules/client/client.module';
import { TaskModule } from './modules/task/task.module';
import { RolesModule } from './modules/roles/roles.module'; 
import { FileModule } from './modules/file/file.module';
import { ProcessModule } from './modules/process/process.module';
import { VehiclesModule } from './modules/vehicles/vehicles.module';
import { ChatModule } from './modules/chat/chat.module';
import { CalendarController } from './modules/calendar/calendar.controller';
import { CalendarService } from './modules/calendar/calendar.service';
import { CalendarModule } from './modules/calendar/calendar.module';


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
    ClientModule,
    TaskModule,
    RolesModule,
    FileModule,
    ProcessModule,
    VehiclesModule,
    ChatModule,
    CalendarModule
  ],
  controllers: [RedirectController],
  providers: [
    {
      provide: APP_FILTER,
      useClass: FilterGlobalException,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggerGlobalInterceptor,
    },
    ConsoleLogger,
  ],
})
export class AppModule {}
