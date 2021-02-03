import { Controller, Get, Post} from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { PlayService } from './play.service';

@Controller('play')
export class PlayController {

    constructor(private playService:PlayService){}
    
}
