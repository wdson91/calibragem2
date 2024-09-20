import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import axios from 'axios';
import { TimeService } from 'src/time.service';
import { AzureBlobStorageService } from 'src/blob/blob.service';
import { DataFrame } from 'danfojs-node';
@Injectable()
export class DecolarService {
  constructor(
    private httpService: HttpService,
    private timeService: TimeService,
    private azureBlobStorageService: AzureBlobStorageService,
  ) { }

  datas = this.timeService.gerarDatasFuturas();
  //datas = ['2025-01-05'];
  dados = [];
  data_atual = this.timeService.getDataAtual();
  async getActivities() {
    for (const data of this.datas) {
      const url = `https://www.decolar.com/ds-shopping/vr/activities/UN_ORL?site=BR&language=PT&fixedDate=2024-12-19&sorting=Relevance&date=${data}&clickedPrice=2218&clickedCurrency=BRL&pageviewId=s-activities-174cfcfa-5bf1-4a13-aac0-b357ec5e52a1`;

      try {
        const response = await axios.get(url, {
          headers: {
            'User-Agent':
              'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:130.0) Gecko/20100101 Firefox/130.0',
            Accept: '*/*',
            'Accept-Language': 'pt-BR,pt;q=0.8,en-US;q=0.5,en;q=0.3',
            'Accept-Encoding': 'gzip, deflate, br, zstd',
            'Accept-Version': '1',
            'X-Tracking': 'page-view',
            'x-client': 's-activities',
            'X-Referer': '',
            Connection: 'keep-alive',
            Referer:
              'https://www.decolar.com/atracoes-turisticas/d-UN_ORL/ingressos+para+universal+orlando+resort-orlando?clickedPrice=2218&priceDate=1726843598375&clickedCurrency=BRL&distribution=1&modalityId=ORL_3-PE-2024M&fixedDate=2024-12-19',
            //Cookie: 'trackerid=093db269-84f2-4dfd-bc4d-c1f2584ae01a; ...', // adicione o cookie completo se necessário
          },
        });

        // Verifique se a resposta contém os dados esperados
        const modalities = response.data?.item?.modalities;

        if (!modalities) {
          console.error('Resposta inesperada:', response.data);
          throw new Error('Resposta inesperada');
        }

        const ingressosUniversal = {
          'Ingresso 1 Parque 1 Dia': '1 Dia 1 Parque - Universal Orlando',
          'Ingresso 2-Park 1-Day Park-to-Park':
            '1 Dia 2 Parques - Universal Orlando',
          'Ingresso 2 Parques 2 Dias (Parque a Parque)':
            '2 Dias 2 Parques - Universal Orlando',
          'Ingresso - Promoção 2 Parques 4 Dias (Parque a Parque)':
            '4 Dias 2 Parques - Universal Orlando',
          'Ingresso Explorer 3 Parques 2024':
            '14 Dias 3 Parques - Universal Orlando',
          'Ingresso 2 parques 3 dias e 2 dias grátis (Park to Park)':
            '5 Dias 2 Parques - Universal Orlando',
          'Ingresso Explorer 3 Parques 2025':
            '14 Dias 3 Parques - Universal Orlando',
        };

        modalities.forEach((modality) => {
          const originalId = modality.id;
          const name = modality.name;
          const netPrice = parseFloat(modality.prices.BRL.advertised.net);

          // Buscando o ID do banco pelo ID original

          // Adicionando os dados ao array
          this.dados.push({
            Data_viagem: data,
            Parque: ingressosUniversal[name] || name,
            'Preco Parcelado': netPrice,
            'Preco Avista': netPrice * 0.97,
          });
        });

        // Criando o DataFrame
      } catch (error) {
        console.error(
          'Erro na requisição:',
          error.response ? error.response.data : error.message,
        );
        throw error; // Ou trate o erro conforme necessário
      }
    }
    const df = new DataFrame(this.dados);

    await this.azureBlobStorageService.salvarDados(
      df,
      `universal_decolar_${this.data_atual}.json`,
      'teste/orlando/decolar',
      '17:02',
    );
  }
}
