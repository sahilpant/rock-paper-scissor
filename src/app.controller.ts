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
    

  
              @Post('/signin')
              @ApiCreatedResponse({description: `to signin the user`})
              @ApiUnauthorizedResponse({description: "Incorrect email or password"})
              signIn(@Body() signin : signin){

                return this.appService.signIn(signin)
  
              }


            }
