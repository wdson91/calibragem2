import { Injectable } from '@nestjs/common';
import { DisneyDecolarService } from './coletas/decolar/orlando/orlando.service';
import { Process, Processor } from '@nestjs/bull';

@Injectable()
@Processor('coletar-precos')
export class AppService {
  constructor(private readonly disneyDecolarService: DisneyDecolarService) { }
  getHello(): string {
    return 'Hello World!';
  }

  @Process('decolar')
  async processarFila(job: any): Promise<any> {
    const { type, data } = job.data;
    //console.log(`Recebido job do tipo: ${type}`);
    //console.log(`Recebido job do tipo: ${type} com data: ${data}`);
    switch (type) {
      case 'disney':
        console.log('Processando Disney');
        await this.disneyDecolarService.disney_decolar(data);
        break;
      case 'seaworld':
        console.log('Processando SeaWorld');
        await this.disneyDecolarService.seaworld_decolar(data);
        break;
      case 'universal':
        console.log('Processando Universal');
        await this.disneyDecolarService.universal_decolar(data);
        break;
      default:
        console.error('Tipo de job desconhecido');
        throw new Error('Tipo de job desconhecido');
    }
  }
}
