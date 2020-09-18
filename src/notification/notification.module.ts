import { Module } from '@nestjs/common';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';
import {getMailerConnectionToken, MailerModule} from 'nestjs-mailer'
import { MongooseModule } from '@nestjs/mongoose';
import { user } from 'src/schemas/user.model';
import { ConfigService } from '@nestjs/config';
@Module({
  imports:[
    MongooseModule.forFeature([{ name: 'user', schema: user },],),
    MailerModule.forRoot({
    config:{
            transport:
            {
            host:'smtp.gmail.com',
            service:'gmail',
            port: 587,
            secure: false, // true for 465, false for other ports
            auth: {
                  user: `namit.cs.rdjps@gmail.com`, // generated ethereal user
                  pass: `namit1999`, // generated ethereal password
                 },}
           }
  }),],
  controllers: [NotificationController],
  providers: [NotificationService]
})
export class NotificationModule {}
