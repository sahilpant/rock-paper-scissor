import { Controller, Post, ValidationPipe, Body ,Get, Param, Delete} from '@nestjs/common';
import { RegisterService } from './register.service';
import { username } from 'src/required/dto/username.dto';
import { ApiCreatedResponse,  ApiOkResponse } from '@nestjs/swagger';
import { reset } from 'src/required/dto/reset.dto';

@Controller('register')
export class RegisterController {

    constructor(private readonly registerService:RegisterService){}

    @Post('/createUser')
    @ApiCreatedResponse({description: 'User Registration'})
    createUser(@Body() userNameDto:username){
      
      return this.registerService.createUser(userNameDto)
    
    }

    @Post('/:forgotUser')
    @ApiOkResponse({description : 'username is staged for resetting the password'})
    resetPass(@Param('forgotUser') name:string){
    
      console.log(name);
      this.registerService.resetPass(name)
    
    }

    @Get('/:show')
    @ApiCreatedResponse({description: 'star assigned for first time signup'})
    showStar(@Param('show') account:string){
      return this.registerService.show(account);
    }

    @Delete('/reset')
    @ApiOkResponse({description : 'username is staged for resetting the password'})
    reset(@Body() reset:reset){
      this.registerService.reset(reset);
    
    }
  }
