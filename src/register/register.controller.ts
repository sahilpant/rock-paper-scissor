import { Controller, Post, ValidationPipe, Body ,Get, Param} from '@nestjs/common';
import { RegisterService } from './register.service';
import { username } from 'src/required/dto/username.dto';
import { ApiCreatedResponse,  ApiOkResponse } from '@nestjs/swagger';

@Controller('register')
export class RegisterController {

    constructor(private readonly registerService:RegisterService){}

    @Post('/createUser')
    @ApiCreatedResponse({description: 'User Registration'})
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
    @ApiCreatedResponse({description: 'star assigned for first time signup'})
    showStar(@Param('showstar') account_star:string){
      return this.registerService.showStar(account_star);
    }

    @Get('/showcards')
    @ApiCreatedResponse({description : 'Cards assigned for first time signup'})
    showCards(@Body('account') account_card:string){
      console.log(account_card)
      return this.registerService.totalCards(account_card);
    }
  }
