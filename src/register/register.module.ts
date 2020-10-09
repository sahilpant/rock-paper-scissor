import { Module } from '@nestjs/common';
import { RegisterController } from './register.controller';
import { RegisterService } from './register.service';
import { MongooseModule } from '@nestjs/mongoose';
import { user } from 'src/schemas/user.model';
import { EmailVerify } from 'src/schemas/EmailVerify.model';
import {RequiredModule} from 'src/required/required.module'
import { NotificationModule } from 'src/notification/notification.module';
@Module({
  imports:[
    RequiredModule,
    
    NotificationModule,
    
    MongooseModule.forFeature([{ name: 'user', schema: user },{name: 'EmailVerify' , schema: EmailVerify}],),],
  
  controllers: [RegisterController],
  
  providers: [RegisterService],

  exports:[RegisterService]

})

export class RegisterModule {}
