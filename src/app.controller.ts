import { Body, Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';

import { InjectQueue, Process, Processor } from '@nestjs/bull';
import { Queue } from 'bull';
import { DisneyDecolarService } from './coletas/decolar/orlando/orlando.service';

@Processor('coletar-precos')
@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private disneyDecolarService: DisneyDecolarService,
    @InjectQueue('coletar-precos') private readonly queue: Queue,
  ) { }

  @Process('coletar-precos')
  processarFila(job: any): any {
    const { type, data } = job.data;
    console.log(`Processando job ${type}`);
    // switch (type) {
    //   case 'disney':
    //     await this.disneyDecolarService.disney_decolar(data);
    //     break;
    //   case 'seaworld':
    //     await this.disneyDecolarService.seaworld_decolar(data);
    //     break;
    //   case 'universal':
    //     await this.disneyDecolarService.universal_decolar(data);
    //     break;
    //   default:
    //     throw new Error('Tipo de job desconhecido');
    // }
  }
}
