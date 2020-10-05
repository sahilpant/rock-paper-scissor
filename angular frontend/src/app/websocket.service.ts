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

     this.socket.emit('handler',"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InNhaGlscGFudDE2QGdtYWlsLmNvbSIsInVzZXJuYW1lIjoidGVzdF9jYXNlIiwicm9sZSI6IlBMQVlFUiIsImlhdCI6MTYwMTQ2NjIwMywiZXhwIjoxNjAxNTAyMjAzfQ.9UOg12V7sit_SzpzBfHOri2nO6wRUUXwJ63EWrbpLuM")
   }

   

}
