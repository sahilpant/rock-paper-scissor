import { Injectable, UnauthorizedException, CanActivate, ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { user } from './required/interfaces/user.interface';
import { JwtPayLoad } from './required/interfaces/jwt-payload.interface';
import * as bcrypt from 'bcrypt'
import { signin } from './required/dto/sign.dto';
@Injectable()
export class AppService 
{

  accessToken="token"
  
  constructor(
              private jwtService:JwtService,
              
              @InjectModel('user')  private readonly user:Model<user>){}
  
              getHello(): string 
  
              {
                return 'Hello World!';
  
              }


  
              async validatePassword(realPassword:string,givenPassword:string,salt:string):Promise<boolean>{
  
                const hash = await bcrypt.hash(givenPassword,salt);
  
                return realPassword === hash;
  
              }    
  
  

  
              async signIn(signin : signin):Promise<string>{
  
                const userinDB = await this.user.findOne({email: `${signin.email}`}).exec();
  
                console.log(userinDB)
  
                if(!userinDB)
  
                {
  
                  throw new UnauthorizedException('invalid_email');
  
                }
  
                else
  
                {
  
          
  
                  const result = await this.validatePassword(userinDB.password,signin.password,userinDB.salt);
                  
                  if(result)
  
                  {

                    const payload:JwtPayLoad = {email: userinDB.email ,username: userinDB.username, role: userinDB.role = 'PLAYER'}
  
                    this.accessToken= this.jwtService.sign(payload);
  
                    return   this.accessToken;
  
                  }
  
                  else
  
                  throw new UnauthorizedException('invalid_password');
  
                }

              }


            }
    
