import { Controller,Post, ValidationPipe, Body } from '@nestjs/common';
import { PlayService } from './play.service';
import { playDto } from 'src/required/dto/play.dto';

@Controller('play')
export class PlayController {

    constructor(private playService:PlayService){}
    

    @Post('/game')
    play(){
         
        this.playService.play("hello")
    }
}
