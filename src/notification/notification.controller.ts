import { Controller, Body, Post, ValidationPipe } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { username } from 'src/required/dto/username.dto';

@Controller('notification')
export class NotificationController {

   constructor(private readonly notificationService:NotificationService){}

  //   @Post('/sendEmail')
  // sendEmail(@Body('name') name:string ){
  //  return  this.notificationService.sendEmail(name);
  // }

}
