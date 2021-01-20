import { Injectable, UnauthorizedException, CanActivate, ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { user } from './required/interfaces/user.interface';
import { JwtPayLoad } from './required/interfaces/jwt-payload.interface';
import * as bcrypt from 'bcrypt'
import { signin } from './required/dto/sign.dto';
import {returnownedTokens,detailOfCard,show_stars} from '../gameblock';
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

                    let rock:number[];
                    let paper:number[];
                    let scissor:number[];
                    let notUSed:number[];
                    console.log(<Int32Array>arrofCards)
                    
                    for(var i=0;i<arrofCards.length;i++)
                    {
                      let carddetail = await detailOfCard(arrofCards[i]);

                      if(carddetail[0] === "1")
                      rock.push(arrofCards[i]);
                      else if(carddetail[0] === "2")
                      paper.push(arrofCards[i]);
                      else if(carddetail[0] === "3")
                      scissor.push(arrofCards[i]);
                      
                      notUSed.push(arrofCards[i]);
                    }

						    
						        userinDB.cards.ROCK = rock;
        
						        
						        userinDB.cards.PAPER = paper;
						        
						        
						        userinDB.cards.SCISSOR = scissor;
        
						        userinDB.notUsedCards = notUSed;
        
						        userinDB.stars = await show_stars(userinDB.publickey);
        
						        await userinDB.save();
  
                    return   this.accessToken;
  
                  }
  
                  else
  
                  throw new UnauthorizedException('invalid_password');
  
                }

              }


            }
    
