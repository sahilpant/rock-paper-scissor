import { Controller, Get, Post, Body, Req, UseGuards, Param } from '@nestjs/common';
import { AppService } from './app.service';
import {ConfigService} from '@nestjs/config';
import { configss} from './Config/configuration';
import { ApiBody, ApiCreatedResponse, ApiOkResponse, ApiResponse, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { signin } from './required/dto/sign.dto';
import { publickey } from './required/dto/publickey.dto';

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

              @Get('/:publickey')
              @ApiOkResponse({description:"returns user details of this public key"})
              @ApiUnauthorizedResponse({description:`<ul>
              <li>User with this public key not exists</li>
              `})
              async getdetails(@Param('publickey') publickey:string):Promise<any>{
                 console.log(publickey);
                 return this.appService.getUserdetails(publickey)
              }


            }
