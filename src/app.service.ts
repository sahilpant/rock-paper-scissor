import { Injectable, UnauthorizedException, CanActivate, ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { user } from './required/interfaces/user.interface';
import { JwtPayLoad } from './required/interfaces/jwt-payload.interface';
import * as bcrypt from 'bcrypt'
import { signin } from './required/dto/sign.dto';
import {returnownedTokens,detailOfCard,show_stars, assetReplinshment} from '../gameblock';
import { date } from '@hapi/joi';
import { publickey } from './required/dto/publickey.dto';
import { asset } from './required/interfaces/assetReplenish.interface';
@Injectable()
export class AppService 
{

  accessToken="token"
  
  constructor(
              private jwtService:JwtService,
              
              @InjectModel('user')  private readonly user:Model<user>,
              @InjectModel('assetReplenish') private readonly asset:Model<asset>){}

              async getUserdetails(publickey):Promise<any>{
                return this.user.findOne({publickey:publickey});
              }

              async assetReplenishEvery24Hour({publickey}:publickey):Promise<any>{
                // console.log(publickey);
                let user = await this.asset.findOne({publickey:publickey});
                const oneDay = 24 * 60 * 60 * 1000;
                const LastDate =user.lastupdated.getTime();
                const CurrentDate = new Date().getTime();
                console.log(oneDay);
                console.log(LastDate);
                console.log(CurrentDate);
                console.log(Math.abs((CurrentDate - LastDate)/oneDay))
                if(user){
                  if(Math.abs((CurrentDate - LastDate)/oneDay) >= 1){
                      (user).lastupdated = new Date();
                      await (user).save();
                      await assetReplinshment(publickey);
                      await this.updateUserdata(publickey);
                  }
                  else
                  return `Asset Replenish Every 24 hr time remaining ${(LastDate+oneDay-CurrentDate)/1000}s`
                }
                else{
                  let new_user = new this.asset();
                  new_user.publickey = publickey;
                  new_user.lastupdated = new Date;
                  await new_user.save();
                  await assetReplinshment(publickey);
                  await this.updateUserdata(publickey);
                }         
              }


              async updateUserdata(publickey:string):Promise<any>{

                var userinDB = await this.user.findOne({publickey: `${publickey}`}).exec()

                let arrofCards = await returnownedTokens(publickey)
                    var rock = [];
                    var paper = [];
                    var scissor = [];
                    var notUSed = [];

                    var completearray = userinDB.notUsedCards.concat(userinDB.usedCards);
                    // console.log(<Int32Array>arrofCards);
                    var isNewCardPresent = arrofCards.filter(function(id){
                      return completearray.indexOf(id) < 0;
                    })

                    if(isNewCardPresent.length > 0){
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
                      var c =  rock.filter(function(id){
                        return userinDB.usedCards.indexOf(id) < 0
                      })
  
                      var d =  paper.filter(function(id){
                        return userinDB.usedCards.indexOf(id) < 0
                      })
  
                      var e =  scissor.filter(function(id){
                        return userinDB.usedCards.indexOf(id) < 0
                      })
                      var f = notUSed.filter(function(id){
                           return userinDB.usedCards.indexOf(id) < 0
                      })

                      
                    userinDB.cards.ROCK = c; 
						        userinDB.cards.PAPER = d;
						        userinDB.cards.SCISSOR = e;
						        userinDB.notUsedCards = f;
						        userinDB.stars = await show_stars(userinDB.publickey);
                    return await userinDB.save();
                    
                    }

              }

              async validatePassword(realPassword:string,givenPassword:string,salt:string):Promise<boolean>{
  
                const hash = await bcrypt.hash(givenPassword,salt);
  
                return realPassword === hash;
  
              }    


              
  
                

  
              async signIn(signin : signin):Promise<string>{
  
                const userinDB = await this.user.findOne({email: `${signin.email}`}).exec();
  
                // console.log(userinDB)
  
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
                    var rock = [];
                    var paper = [];
                    var scissor = [];
                    var notUSed = [];
                    var completearray = userinDB.notUsedCards.concat(userinDB.usedCards);
                    // console.log(<Int32Array>arrofCards);
                    var isNewCardPresent = arrofCards.filter(function(id){
                      return completearray.indexOf(id) < 0;
                    })

                    if(isNewCardPresent.length > 0){

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
                    var c =  rock.filter(function(id){
                      return userinDB.usedCards.indexOf(id) < 0
                    })

                    var d =  paper.filter(function(id){
                      return userinDB.usedCards.indexOf(id) < 0
                    })

                    var e =  scissor.filter(function(id){
                      return userinDB.usedCards.indexOf(id) < 0
                    })
                    var f = notUSed.filter(function(id){
                         return userinDB.usedCards.indexOf(id) < 0
                    })
                    userinDB.cards.ROCK = c; 
						        userinDB.cards.PAPER = d;
						        userinDB.cards.SCISSOR = e;
						        userinDB.notUsedCards = f;
						        userinDB.stars = await show_stars(userinDB.publickey);
						        await userinDB.save();  
                    return  this.accessToken;
                    }

                    else{
                     console.log("I was here")
                      return  this.accessToken;
                    }  
                  }
  
                  else
                  throw new UnauthorizedException('invalid_password');
  
                }

              }


            }
    
