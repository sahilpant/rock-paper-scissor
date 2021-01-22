import { Injectable, UnauthorizedException, CanActivate, ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { user } from './required/interfaces/user.interface';
import { JwtPayLoad } from './required/interfaces/jwt-payload.interface';
import * as bcrypt from 'bcrypt'
import { signin } from './required/dto/sign.dto';
import {returnownedTokens,detailOfCard,show_stars} from '../gameblock';
import { date } from '@hapi/joi';
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

                    let arrofCards = await returnownedTokens(userinDB.publickey)

                  
                    console.log(<Int32Array>arrofCards)
                    
                    for(var i=0;i<arrofCards.length;i++)
                    {
                      let carddetail = await detailOfCard(arrofCards[i]);

                      if(carddetail[0] === "1"  && !userinDB.cards.ROCK.find(arrofCards[i]))
                      userinDB.cards.ROCK.push(arrofCards[i]);
                      else if(carddetail[0] === "2" && !userinDB.cards.PAPER.find(arrofCards[i]))
                      userinDB.cards.PAPER.push(arrofCards[i]);
                      else if(carddetail[0] === "3" && !userinDB.cards.SCISSOR.find(arrofCards[i]))
                      userinDB.cards.SCISSOR.push(arrofCards[i]);
                      
                      if(!userinDB.notUsedCards.find(arrofCards[i]))
                      userinDB.notUsedCards.push(arrofCards[i]);
                    }

                    await userinDB.save();

                    await userinDB.updateOne({$set:{stars:await show_stars(userinDB.publickey)}});
                    
                    await userinDB.updateOne({$set:{lastUpdated:new Date()}});
                    
                    return   this.accessToken;
  
                  }
  
                  else
  
                  throw new UnauthorizedException('invalid_password');
  
                }

              }


            }
    
