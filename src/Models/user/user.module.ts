import { Module } from '@nestjs/common';
import { EventsGateway } from './user.gateway';
import { AuthGuard } from './user.guards';

@Module({
    imports: [],
  providers: [EventsGateway, AuthGuard],
  exports: [EventsGateway],
})
export class UserModule {}
