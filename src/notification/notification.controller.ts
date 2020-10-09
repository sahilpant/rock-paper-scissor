import { Body, Controller, Get, Post} from '@nestjs/common';
import { NotificationService } from './notification.service';


@Controller('noti')
export class NotificationController {

   constructor(private readonly notificationService:NotificationService){}

   @Post('/test')
   async test(@Body('id') id:string){
    await this.notificationService.test(id);
   }
}
