import { Injectable } from '@angular/core';
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

     this.socket.emit('handler',"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InNhaGlscGFudDE2QGdtYWlsLmNvbSIsInVzZXJuYW1lIjoidGVzdF9jYXNlIiwicm9sZSI6IlBMQVlFUiIsImlhdCI6MTYwMDY3Mjk0NCwiZXhwIjoxNjAwNjc2NTQ0fQ.ZbpNc650rIdnkg7Rwlo5ZnHisDWim4zwyUVPzV4BcOU")
   }

   

}
