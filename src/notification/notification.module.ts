import { Module } from '@nestjs/common';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';
import { MailerModule} from 'nestjs-mailer'
import { MongooseModule } from '@nestjs/mongoose';
import { user } from 'src/schemas/user.model';
import { ConfigService } from '@nestjs/config';
import { SocketModule } from 'src/models/socket/socket.module';
import { EventsGateway } from 'src/models/user/user.gateway';
import { AuthGuard } from 'src/Models/user/user.guards';
import { UserModule } from 'src/models/user/user.module';
@Module({
  imports:[
    MongooseModule.forFeature([{ name: 'user', schema: user },],),
    UserModule,
    MailerModule.forRoot({
    config:{
            transport:
            {
            host:'smtp.gmail.com',
            service:'gmail',
            port: 587,
            secure: false, // true for 465, false for other ports
            auth: {
                  user: `projectt039@gmail.com`, // generated ethereal user
                  pass: `nj@880088`, // generated ethereal password
                 },}
           }
  }),],
  controllers: [NotificationController],
  providers: [NotificationService,AuthGuard],
  exports: [NotificationService]
})
export class NotificationModule {}
