import { Module } from '@nestjs/common';
import { RegisterController } from './register.controller';
import { RegisterService } from './register.service';
import { MongooseModule } from '@nestjs/mongoose';
import { user } from 'src/schemas/user.model';
import { NotificationService } from 'src/notification/notification.service';
import { passKey } from 'src/schemas/passkey.model';
import {RequiredModule} from 'src/required/required.module'
@Module({
  imports:[
    RequiredModule,
    MongooseModule.forFeature([{ name: 'user', schema: user },{name: 'passkey' , schema: passKey}],),],
  controllers: [RegisterController],
  providers: [RegisterService,NotificationService]
})
export class RegisterModule {}
