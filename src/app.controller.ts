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
              @ApiCreatedResponse({description: `<ul>
              <li>{token : "jwt_token"}</li>
              </ul>`})
              @ApiUnauthorizedResponse({description: `<ul>
              <li>invalid_emailid -  If email Id is not registered.</li>
              <li>invalid_password - If password is incorrect</li>
              </ul>
             `})
              signIn(@Body() signin : signin){

                var res = this.appService.signIn(signin);
                return res;
  
              }


            }
