import { Injectable, UnauthorizedException, CanActivate, ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { user } from './required/interfaces/user.interface';
import { JwtPayLoad } from './required/interfaces/jwt-payload.interface';
import * as bcrypt from 'bcrypt'
@Injectable()
export class AppService 
{

  accessToken="token"
  constructor(private jwtService:JwtService,
              @InjectModel('user')  private readonly user:Model<user>){}
  getHello(): string 
  {
    return 'Hello World!';
  }


  async validatePassword(realPassword:string,givenPassword:string,salt:string):Promise<boolean>{
    const hash=await bcrypt.hash(givenPassword,salt);
    return realPassword === hash;
  }    
  
  

  async signIn(username:string,pass:string):Promise<string>{
    const userinDB= await this.user.findOne().where('username').equals(username).exec();
    console.log(userinDB)
    if(!userinDB)
    {
      throw new UnauthorizedException('Invalid Credentials');
    }
    else
    {
      console.log("user exists")
      const result = await this.validatePassword(userinDB.password,pass,userinDB.salt)
      if(result)
      {
        const payload:JwtPayLoad = {email: userinDB.email ,username: userinDB.username}
        this.accessToken= await this.jwtService.sign(payload);
        return this.accessToken;
      }
      else
       throw new UnauthorizedException('Invalid Credentials');
    }

  }
}
    
