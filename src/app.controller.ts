import { Controller, Get, Post, Body, Req, UseGuards, Param } from '@nestjs/common';
import { AppService } from './app.service';
import {ConfigService} from '@nestjs/config';
import { configss} from './Config/configuration';
import { ApiBearerAuth, ApiBody, ApiCreatedResponse, ApiOkResponse, ApiResponse, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { signin } from './required/dto/sign.dto';
import { publickey } from './required/dto/publickey.dto';
import { GetUser } from './get-user.decorator';
import { AuthGuard } from '@nestjs/passport';

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
              @ApiOkResponse({description:"returns Updated user details of this public key"})
              @ApiUnauthorizedResponse({description:`<ul>
              <li>User with this public key not exists</li>
              `})
              async getdetails(@Param('publickey') publickey:string):Promise<any>{
                 console.log(publickey);
                 return await this.appService.getUserdetails(publickey);
                 
              }

              @Post('/replenish')
              @ApiOkResponse({description:"replensih user assets"})
              @ApiBearerAuth()
              @UseGuards(AuthGuard())
              @ApiUnauthorizedResponse({description:`<ul>
              <li>User with this public key not exists</li>
              `})
              async replensih(@Body()publickey:publickey,@GetUser() user){
                console.log(user);
                return this.appService.assetReplenishEvery24Hour(publickey);
              }

            }
