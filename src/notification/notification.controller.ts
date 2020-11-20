import { Body, Controller, Get, Post} from '@nestjs/common';
import { NotificationService } from './notification.service';


@Controller('noti')
export class NotificationController {

   constructor(private readonly notificationService:NotificationService){}

   @Post('/test')
   async test(){
    await this.notificationService.send_room_code("namit.cs.rdjps@gmail.com","4777388");
   }
}
