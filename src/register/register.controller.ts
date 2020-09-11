import { Controller, Post, ValidationPipe, Body } from '@nestjs/common';
import { RegisterService } from './register.service';
import { username } from 'src/required/dto/username.dto';

@Controller('register')
export class RegisterController {

    constructor(private readonly registerService:RegisterService){}

    @Post('/createUser')
    createUser(@Body(ValidationPipe) userNameDto:username){
      return this.registerService.createUser(userNameDto)
    }

    @Post('/forgotUser')
    resetPass(@Body('name') name:string){
      this.registerService.resetPass(name)
    }

    @Post('/reset')
    reset(@Body('key') key:string,@Body('newPass') newPass:string,@Body('name') name:string){
     this.registerService.reset(key,newPass,name);
    }
}
