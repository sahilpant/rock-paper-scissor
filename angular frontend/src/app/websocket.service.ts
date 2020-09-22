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

     this.socket.emit('handler',"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InNhaGlscGFudDE2QGdtYWlsLmNvbSIsInVzZXJuYW1lIjoidGVzdF9jYXNlIiwicm9sZSI6IlBMQVlFUiIsImlhdCI6MTYwMDc1NDIwMCwiZXhwIjoxNjAwNzU3ODAwfQ.zy0Iygl3_6FSKpuLlM0hJwuLsQDhdaK62cGgNMO1ir4")
   }

   

}
