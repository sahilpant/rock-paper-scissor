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

     this.socket.emit('handler',"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InNhaGlsQG1haWwuY29tIiwidXNlcm5hbWUiOiJuZXdfc2FoaWwiLCJyb2xlIjoiUExBWUVSIiwiaWF0IjoxNjAwODUzNzgxLCJleHAiOjE2MDA4NTczODF9.2OXuNwDw__rU9sP7_l5Pm_UQ1mKBlv7T-A-y744KeVk")
   }

   

}
