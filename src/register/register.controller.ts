import { Controller, Post, ValidationPipe, Body ,Get} from '@nestjs/common';
import { RegisterService } from './register.service';
import { username } from 'src/required/dto/username.dto';

@Controller('register')
export class RegisterController {

    constructor(private readonly registerService:RegisterService){}

    @Post('/createUser')
    createUser(@Body() userNameDto:username){
      
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

    @Get('/showstar')
    showStar(@Body('account') account:string){
      return this.registerService.showStar(account);
    }

    @Get('/showcards')
    showCards(@Body('account') account:string){
      return this.registerService.totalCards(account);
    }
  }
