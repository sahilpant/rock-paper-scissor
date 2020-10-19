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
      publickey:"rrweeeeeeeeeeeeeeeeee",
      username:localStorage.getItem('username')
    }
    this.socket.emit('Public', data )
   }


   matchdetails(){
    var data = {
      jwt_token: token,
      match_type: "short",
      publickey:"rrweeeeeeeeeeeeeeeeee",
      username:localStorage.getItem('username')
    }
    this.socket.emit('fetch__match_details',data);
    

   }
   

}
