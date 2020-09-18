import { Injectable } from '@angular/core';
import {map} from 'rxjs/operators'
import {Socket} from 'ngx-socket-io'
@Injectable({
  providedIn: 'root'
})
export class WebsocketService {

  constructor(private socket:Socket) { }
 
   onConnection(){
     this.socket.on('connection',data=> console.log(data))
   }

   handlereq(){

     this.socket.emit('handler',"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InN0cmluZyIsInVzZXJuYW1lIjoic3RyaW5nIiwicm9sZSI6IlBMQVlFUiIsImlhdCI6MTYwMDQwNjYyNywiZXhwIjoxNjAwNDEwMjI3fQ.k5riHkPec_hwYSpXovcpgkLhtB6ccer99e4Hp9W43y8")
   }

   

}
