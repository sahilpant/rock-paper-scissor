import { Module } from '@nestjs/common';
import { RegisterController } from './register.controller';
import { RegisterService } from './register.service';
import { MongooseModule } from '@nestjs/mongoose';
import { user } from 'src/schemas/user.model';
import { NotificationService } from 'src/notification/notification.service';
import { EmailVerify } from 'src/schemas/EmailVerify.model';
import {RequiredModule} from 'src/required/required.module'
import * as gameblock from '../../gameblock'
import { NotificationModule } from 'src/notification/notification.module';
@Module({
  imports:[
    RequiredModule,
    NotificationModule,
    MongooseModule.forFeature([{ name: 'user', schema: user },{name: 'EmailVerify' , schema: EmailVerify}],),],
  
  controllers: [RegisterController],
  
  providers: [RegisterService]

})

export class RegisterModule {}
