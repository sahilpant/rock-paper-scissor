import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as Joi from '@hapi/joi';
import { Injectable } from '@nestjs/common';
import * as path from 'path';
import IEnvConfigInterface from './IEnvConfigInterface';

@Injectable()
class ConfigService {

    private readonly envConfig: IEnvConfigInterface;
  
    constructor(filePath: string) {
  
      const config = dotenv.parse(fs.readFileSync(filePath));
  
      this.envConfig = config;
  
    }


  }