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

     this.socket.emit('handler',"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InRlc3RfMTFAZW1haWwuY29tIiwidXNlcm5hbWUiOiJ0ZXN0XzExIiwicm9sZSI6IlBMQVlFUiIsImlhdCI6MTYwMjE1NTI5OCwiZXhwIjoxNjAyMTU4ODk4fQ.1ZjvzrXREArzggeE3_jxinmJz5tUv5SY0Hv_8isw7u4")
   }

   

}
