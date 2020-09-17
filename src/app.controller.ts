import { Controller, Get, Post, Body, Req, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import {ConfigService} from '@nestjs/config';
import { configss} from './Config/configuration';
import { ApiCreatedResponse, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { signin } from './required/dto/sign.dto';

@Controller()
export class AppController {

  constructor(
              private readonly appService: AppService, 
              
              private configService:ConfigService,
               
              private  configser:configss) {}
    
  
              // @Get()
              // getHello(): string {

              //   const dbhost = this.configService.get<string>('database.port')
  
              //   console.log(dbhost)
  
              //   console.log(dotEnvOptions)
    
              //   return this.appService.getHello();
  
              // }

  
              @Post('/signin')
              @ApiCreatedResponse({description: `to signin the user`})
              @ApiUnauthorizedResponse({description: "Incorrect username or password"})
              signIn(@Body() signin : signin){
    
                console.log(signin.name+" "+signin.password)
    
                return this.appService.signIn(signin)
  
              }


              // @Post('/test')
              // @UseGuards(AuthGuard())
              // test(@Req() req)
  
              // {
  
              //   console.log(req)
  
              // }
            }
