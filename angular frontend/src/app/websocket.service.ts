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

     this.socket.emit('handler',"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InVpIiwidXNlcm5hbWUiOiJ0ZXN0MyIsInJvbGUiOiJQTEFZRVIiLCJpYXQiOjE2MDA4NDk0MDEsImV4cCI6MTYwMDg1MzAwMX0.r1nNUD6KIB-mpNCjsUyGAAUVle-6s5YcH5IRcJrjNk0")
   }

   

}
