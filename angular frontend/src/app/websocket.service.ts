import { Injectable } from '@angular/core';
import {map} from 'rxjs/operators'
import {Socket} from 'ngx-socket-io';

import {token} from './app.module'
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

   public(){
    console.log(token);
    var data = {
        jwt_token: token,
        match_type: "short",
        publickey:"0x1A116902f5eEa93ef63055B6a0B630DE31d67F3A",
        username:localStorage.getItem('username')
      }
    this.socket.emit('Public', data )
   }


   matchdetails(){
    var data = {
      jwt_token: token,
      match_type: "short",
      publickey:"0x71fa8E0f9C95850c2f0a5a436cA6A120a8f18DEC",
      username:localStorage.getItem('username')
    }
    console.log(data)
    this.socket.emit('fetch_match_details',data);

   }


   startmatch(){
     var proom =localStorage.getItem('roomID');
     console.log(proom);
    var data = {
      jwt_token: token,
      match_type: "short",
      publickey:"0x1A116902f5eEa93ef63055B6a0B630DE31d67F3A",
      username:localStorage.getItem('username'),
      gameid:"c29b47d8-e7c9-4636-8a06-9baac2d97047",
      roomID: proom
    }
    
    console.log(data);
    this.socket.emit('start_match',data);
   }

   activerooms(){
    var data = {
      jwt_token: token,
      match_type: "short",
      publickey:"0xd824eE6FD2A1C151020A0355a7aD8256AE623345",
      username:localStorage.getItem('username'),
      gameid:"c29b47d8-e7c9-4636-8a06-9baac2d97047"
    }
     this.socket.emit('activerooms', data);
   }

   getroomID(){
    var data = {
      jwt_token: token,
      match_type: "short",
      publickey:"0xd824eE6FD2A1C151020A0355a7aD8256AE623345",
      username:localStorage.getItem('username'),
      gameid:"c29b47d8-e7c9-4636-8a06-9baac2d97047"
    }
     this.socket.emit('getroomID', data);
   }
   

   play(){
    var data = {
      jwt_token: token,
      match_type: "short",
      publickey:"0x1A116902f5eEa93ef63055B6a0B630DE31d67F3A",
      username:localStorage.getItem('username'),
      card_number:1517,
      gameid:"5e6a1022-e1b6-491a-8c78-5038fff80d20"
    }
    
    console.log(data);
    this.socket.emit('play',data);
   }
   

}
