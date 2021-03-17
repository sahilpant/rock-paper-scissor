import { Injectable } from '@angular/core';
import {map} from 'rxjs/operators'
import {Socket} from 'ngx-socket-io';

import {token} from './app.module'
import { number } from '@hapi/joi';
@Injectable({
  providedIn: 'root'
})
export class WebsocketService {

  constructor(private socket:Socket) { }
 
   onConnection(){
    //  console.log("connection was called")
     this.socket.on('Connection',data=> console.log(data))
   }

   handlereq(){
     this.socket.emit('Auth',"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InRlc3RfMTBAZW1haWwuY29tIiwidXNlcm5hbWUiOiJ0ZXN0XzEwIiwicm9sZSI6IlBMQVlFUiIsImlhdCI6MTYwMjE1MTg5MSwiZXhwIjoxNjAyMTU1NDkxfQ.n3i7cjcqsdxS_nc4gqvqiGosTosuFG5sTVgQCQUA83c")
   }

   testmessage(){
     this.socket.emit('Message', "ddddd")
   }

   checkmsg(){
     this.socket.emit('room_check', "abcd");
   }

   public(){
    var data = {
        jwt_token: token,
        match_type: "short",
        publickey:localStorage.getItem('publickey'),
        username:localStorage.getItem('username'),
      }
    this.socket.emit('Public', data )
   }

   Online(){
    var data = {
        jwt_token: token
      }
    this.socket.emit('online_users', data )
   }

   

   private(){
    var data = {
        jwt_token: token,
        match_type: "long",
        publickey:localStorage.getItem('publickey'),
        username:localStorage.getItem('username'),
        palyer2:"james",
        address2:"0x860b8fb1306d94354A19A1b8a75a5b49cb690e80"
      }
      console.log("private was called");
    this.socket.emit('private', data )
   }

   pendingrequest(){

    var data = {
      jwt_token: token,
      match_type: "long",
      publickey:localStorage.getItem('publickey'),
      username:localStorage.getItem('username'),
      palyer2:"singhsrahul8",
      address2:"0x860b8fb1306d94354A19A1b8a75a5b49cb690e80"
    }

    this.socket.emit('pending_match_request', data )

   }

   invite(){
    var data = {
        jwt_token: token,
        match_type: "short",
        publickey:localStorage.getItem('publickey'),
        username:localStorage.getItem('username'),
        email:localStorage.getItem('email')
      }
    this.socket.emit('invite', data )
   }

   joingamebyInvite(){
    var data = {
        jwt_token: token,
        publickey:localStorage.getItem('publickey'),
        username:localStorage.getItem('username'),
        email:localStorage.getItem('email'),
        gameid:localStorage.getItem('gameID')

      }
    this.socket.emit('joinGameByInvite', data )
   }


   matchdetails(){
    var data = {
      jwt_token: token,
      match_type: "short",
      publickey:localStorage.getItem('publickey'),
      username:localStorage.getItem('username')
    }
    console.log(data)
    this.socket.emit('fetch_match_details',data);

   }


   startmatch(){

    var data = {
      jwt_token: token,
      match_type: "short",
      publickey:localStorage.getItem('publickey'),
      username:localStorage.getItem('username'),
      gameid: localStorage.getItem('roomID'),
    }
    localStorage.setItem('card_position_array',JSON.stringify("[true,true,true,false,false,false,false,false,false]"));
    data["card_pos_array"] = localStorage.getItem('card_position_array');
    console.log(data);
    this.socket.emit('start_match',data);
   }



   activerooms(){
    var data = {
      jwt_token: token,
      match_type: "short",
      publickey:localStorage.getItem('publickey'),
      username:localStorage.getItem('username'),
      gameid: localStorage.getItem('gameID'),
    }
     this.socket.emit('activerooms', data);
   }

   getgameID(){
    var data = {
      jwt_token: token,
      match_type: "short",
      publickey:localStorage.getItem('publickey'),
      username:localStorage.getItem('username'),
      gameid: localStorage.getItem('gameID'),
    }
     this.socket.emit('getroomID', data);
   }
   

   play(){
    var data = {
      jwt_token: token,
      match_type: "short",
      // publickey:localStorage.getItem('publickey'),
      username:localStorage.getItem('username'),
      gameid: localStorage.getItem('roomID'),
      card_number:localStorage.getItem('cardno'),
      card_position:localStorage.getItem('cardpos')
    }
    let card_pos = <number><unknown>(data.card_position)
    if(card_pos <= 9){
      this.socket.emit('move',data);
    }
    
   }

   endGame(){
    var data = {
      jwt_token: token,
      publickey:localStorage.getItem('publickey'),
      username:localStorage.getItem('username'),
      gameid: localStorage.getItem('roomID'),
    } 
    
    console.log(data);
    this.socket.emit('End_Game',data);
   }

   deleteGame(){
     var data ={
       gameid:localStorage.getItem('roomID')
     }
     this.socket.emit('roundetails', data);
   }

   joinroom(){
     console.log("ddd")
     this.socket.emit('joinRoom',"1234");
   }

   userinfo(){
     var data ={
       username:localStorage.getItem('username')
     }
     this.socket.emit('userinfo',data)
   }

   chat(){
     this.socket.emit('chat',"12345");
   }

   guest_action(){
     var data ={
       "jwt_token":token,
       'gameid':"43bf985a-487b-4f33-86dc-af0cfc065d23",
       "action":"1"
     }
    
    this.socket.emit('invitee_action',data);
  }
    
}
