import { string } from '@hapi/joi';
import { Body, Controller, Get, Post} from '@nestjs/common';
import { ApiBody } from '@nestjs/swagger';
import { username } from 'src/required/dto/username.dto';
import { findUser } from 'src/required/dto/FindUser.dto';
import { NotificationService } from './notification.service';


@Controller('noti')
export class NotificationController {

   constructor(private readonly notificationService:NotificationService){}

   @Post('/test')
   async test(){
    await this.notificationService.send_room_code("namit.cs.rdjps@gmail.com","4777388");
   }
   @Post('/findUser')
   @ApiBody({type:findUser})
   async findUser(@Body() data:findUser):Promise<any>{
      console.log(data);
    return await this.notificationService.findUser(data.key);
   }
   
}
