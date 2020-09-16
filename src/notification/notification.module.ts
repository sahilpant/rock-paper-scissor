import { Module } from '@nestjs/common';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';
import {MailerModule} from 'nestjs-mailer'
import { MongooseModule } from '@nestjs/mongoose';
import { user } from 'src/schemas/user.model';
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
                  user: process.env.user, // generated ethereal user
                  pass: process.env.pass, // generated ethereal password
                 },}
           }
  }),],
  controllers: [NotificationController],
  providers: [NotificationService]
})
export class NotificationModule {}
