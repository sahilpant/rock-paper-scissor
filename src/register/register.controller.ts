import { Controller, Post, ValidationPipe, Body ,Get, Param, Delete} from '@nestjs/common';
import { RegisterService } from './register.service';
import { username } from 'src/required/dto/username.dto';
import { ApiBody, ApiCreatedResponse,  ApiNotFoundResponse,  ApiOkResponse, ApiParam } from '@nestjs/swagger';
import { reset } from 'src/required/dto/reset.dto';

@Controller('register')
export class RegisterController {

    constructor(private readonly registerService:RegisterService){}

    @Post('/createUser')
    @ApiBody({type: username})
    @ApiCreatedResponse({description: 'User Registration'})
    createUser(@Body() userNameDto:username){
      
      return this.registerService.createUser(userNameDto)
    
    }

    @Post('/:forgotUser')
    @ApiCreatedResponse({description : 'username is staged for resetting the password'})
    resetPass(@Param('forgotUser') name:string){
    
      console.log(name);
      this.registerService.resetPass(name)
    
    }

    @Get('/:show')
    @ApiOkResponse({description: 'stars and cards assigned for first time signup'})
    showStar(@Param('show') account:string){
      return this.registerService.show(account);
    }

    @Delete('/:reset')
    @ApiOkResponse({description : 'resetting of the password is done'})
    @ApiBody({type:reset})
    reset(@Body() reset:reset){
      console.log(reset); 
      this.registerService.reset(reset);
    
    }
  }
