import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import {SocketIoConfig,SocketIoModule} from 'ngx-socket-io';
export var token = localStorage.getItem('token');
// export var token ="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InNpbmdoc3JhaHVsNzlAZ21haWwuY29tIiwidXNlcm5hbWUiOiJzaW5naHNyYWh1bDc5Iiwicm9sZSI6IlBMQVlFUiIsImlhdCI6MTYwMzA5NDMyOSwiZXhwIjoxNjAzMDk3OTI5fQ.zgpXfUUDXZFZv_NSMnBa-GY4hyjAF1k6P4znjTXAkW4"
const config:SocketIoConfig={url:`http://localhost:8080/game?token=`+token,options:{}}
// const config:SocketIoConfig={url:'http://localhost:8080/game?token=abc',options:{query:"gdgdggdgdgdg"}}
// const config:SocketIoConfig={url:'http://13.59.38.137:8080/game',options:{query:"gdgdggdgdgdg"}}
// const config:SocketIoConfig={url:`http://13.59.38.137:8080/game?token=`+token,options:{}}


@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    SocketIoModule.forRoot(config)
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
