import { Module } from '@nestjs/common';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';
import { MailerModule} from 'nestjs-mailer'
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
                  user: `namit.cs.rdjps@gmail.com`, // generated ethereal user
                  pass: `namit1999`, // generated ethereal password
                 },}
           }
  }),],
  controllers: [NotificationController],
  providers: [NotificationService],
  exports:[NotificationService]
})
export class NotificationModule {}
