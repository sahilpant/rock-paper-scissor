import { Controller} from '@nestjs/common';
import { PlayService } from './play.service';

@Controller('play')
export class PlayController {

    constructor(private playService:PlayService){}
    
}
