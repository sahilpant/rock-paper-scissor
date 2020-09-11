import { Controller, Get, Post, Body, Req, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import {ConfigModule, ConfigService} from '@nestjs/config';
import { configss} from './Config/configuration';
import * as dotEnvOptions from "./Config/dotenv-options"
import { AuthGuard } from '@nestjs/passport';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService, private configService:ConfigService,private  configser:configss) {}
    
  @Get()
  getHello(): string {

    const dbhost = this.configService.get<string>('database.port')
    console.log(dbhost)
    console.log(dotEnvOptions)
    // console.log(this.configser.port);
    // console.log(this.configService.get('PORT'))
    
    return this.appService.getHello();
  }

  @Post('/signin')
  signIn(@Body('name')name:string,@Body('password')password:string){
    console.log(name+" "+password)
    return this.appService.signIn(name,password)
  }

  // @Get('/token')
  // async can(@Body('accesstoken')accesstoken:string):Promise<any>{
  // return this.appService.vaildate(accesstoken)
  // }

  @Post('/test')
  @UseGuards(AuthGuard())
  test(@Req() req)
  {
    console.log(req)
  }

  @Get('/helloserver')
  hello(@Req() req){
    console.log(req)
    return req
  }
}
