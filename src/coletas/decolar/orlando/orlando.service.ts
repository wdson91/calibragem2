import { TimeService } from './../../../time.service';
import { PrismaService } from './../../../prisma.service';
/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import * as _ from 'lodash';
import * as moment from 'moment-timezone';

@Injectable()
export class DisneyDecolarService {
  constructor(private prismaService: PrismaService, private timeService: TimeService) { }
  private cleanPrice(priceString: string): number | null {
    if (typeof priceString === 'string') {
      let cleanString = priceString.slice(-7).trim(); // Pega os últimos 7 caracteres
      cleanString = cleanString
        .replace('.', '')
        .replace(',', '.')
        .replace('R$', '')
        .trim();
      return parseFloat(cleanString) || null;
    }
    return null;
  }

  disney_decolar(jsonData: object[]): any[] {
    let dataList = jsonData; // Recebe a lista de objetos JSON enviada na solicitação

    // Trim 'Parque' field in each item
    dataList = dataList.map((item) => {
      item['Parque'] = item['Parque'].trim();
      return item;
    });

    // Mapeamento dos nomes dos parques
    const mapping = {
      'Ingresso de 1 dia Magic Kingdom Park': '1 Dia - Disney Basico Magic Kingdom',
      'Ingresso de 1 dia Disney Park Hollywood Studios': '1 Dia - Disney Basico Hollywood Studios',
      'Ingresso de 1 dia para o Disney Animal Kingdom Park': '1 Dia - Disney Basico Animal Kingdom',
      'Ingresso de 1 dia EPCOT Park': '1 Dia - Disney Basico Epcot',
      'Ingresso de 2 dias': '2 Dias - Disney World Basico',
      'Ingresso de 3 dias': '3 Dias - Disney World Basico',
      'Ingresso Mágico 4 dias - 4 parques': '4 Dias - Disney Promocional',
      'Ingresso Mágico 4 dias - 4 parques + Parques Aquáticos e Esportes Adicionais': '4 Dias - Disney Promocional com Aquatico e Esportes',
      'Ingresso de 4 dias': '4 Dias - Disney World Basico',
      'Ingresso de 5 dias': '5 Dias - Disney World Basico',
      'Ingresso de 6 dias': '6 Dias - Disney World Basico',
      'Ingresso de 7 dias': '7 Dias - Disney World Basico',
      'Ingresso de 8 dias': '8 Dias - Disney World Basico',
      'Ingresso de 9 dias': '9 Dias - Disney World Basico',
      'Ingresso de 10 dias': '10 Dias - Disney World Basico',
    };

    // Filtrar a lista com base nos parques válidos
    let filteredDataList = dataList.filter((item) => mapping[item['Parque']]);

    // Atualiza os nomes dos parques de acordo com o mapeamento
    filteredDataList = filteredDataList.map((item) => {
      item['Parque'] = mapping[item['Parque']];
      return item;
    });

    // Ordenar a lista por 'Data_viagem' e 'Parque'
    filteredDataList = _.orderBy(
      filteredDataList,
      ['Data_viagem', 'Parque'],
      ['asc', 'asc'],
    );

    // Atualizar o preço à vista (97% do preço parcelado)
    filteredDataList = filteredDataList.map((item) => {
      item['Preco_Avista'] = item['Preco_Parcelado'] * 0.97;
      return item;
    });

    // Agrupar por 'Data_viagem'
    const groupedData = _.groupBy(filteredDataList, 'Data_viagem');

    // Formatar os dados no formato especificado
    const formattedData = [];
    _.forEach(groupedData, (value, key) => {
      formattedData.push({
        Data_viagem: key,
        Dados: value.map((item) => ({
          Data_viagem: item.Data_viagem,
          Parque: item.Parque,
          Preco_Parcelado: item.Preco_Parcelado,
          Preco_Avista: item.Preco_Avista,
        })),
      });
    });

    return formattedData;
  }

  async seaworld_decolar(jsonData: object[]): Promise<any> {
    // Mapeamento dos nomes dos parques
    const mapping = {
      'Ingresso para 1 parque': '1 Dia 1 Parque - SeaWorld Orlando',
      'Visite 3 parques pelo preço de 2': '3 Dias 3 Parques - SeaWorld Orlando',
      'Visitas ilimitadas + estacionamento gratuito': '14 Dias 3 Parques - SeaWorld Orlando',
      'Visite 3 parques ao preço de 2 com plano de refeições': '3 Dias 3 Parques com Refeições - SeaWorld Orlando',
      'PROMO Combo SeaWorld e Busch Gardens com comida': '2 Dias 2 Parques - SeaWorld Orlando',
      'SeaWorld e Busch Gardens com 1 refeição grátis': '2 Dias 2 Parques com Refeição no Busch Gardens - SeaWorld Orlando',
    };

    const daysToAdd = [5, 10, 20, 47, 65, 126];
    const saoPauloTz = 'America/Sao_Paulo';
    const currentDate = moment().tz(saoPauloTz).startOf('day');
    const Hora_coleta = jsonData[0]['Hora_coleta'];
    // Limpar os dados e aplicar o mapeamento de parques
    const filteredData = jsonData
      .map((item) => {
        const parque = item['Parque']?.trim();
        return {
          ...item,
          Parque: mapping[parque] || null,
        };
      })
      .filter((item) => item.Parque); // Remove itens que não têm correspondência de parque

    // Iterar sobre as datas de viagem e formatar os dados
    const formattedData = daysToAdd.map((days) => {
      const dataViagem = currentDate.clone().add(days, 'days').format('YYYY-MM-DD');

      // Duplicar os dados para cada data de viagem e calcular o Preco_Avista
      return filteredData.map((item: any) => ({
        Data_viagem: dataViagem,
        Parque: item.Parque,
        Preco_Parcelado: item.Preco_Parcelado,
        Preco_Avista: item.Preco_Parcelado ? item.Preco_Parcelado * 0.97 : null,
      }));
    });

    // Unificar todos os dados formatados em um único array
    const flattenedData = _.flatten(formattedData);

    // Agora vamos criar os registros que serão salvos no banco de dados
    const registros = flattenedData.map((dado: any) => {
      return {
        empresa: null, // Substitua pelo ID da empresa se disponível
        data_coleta: new Date(), // Data atual da coleta
        data_viagem: new Date(dado.Data_viagem), // Data da viagem recebida do array datas
        hora_coleta: this.timeService.adjustToGMTMinus3(Hora_coleta), // Ajusta a hora da coleta
        parque: null,//dado.Parque, // O parque já está mapeado
        preco_parcelado: dado.Preco_Parcelado,
        preco_avista: dado.Preco_Avista, // Calculado acima
        margem: null, // Calcule a margem se aplicável
        margem_cat: null, // Calcule a margem da categoria se aplicável
        categoria: null, // Substitua pelo ID da categoria se disponível
      };
    });


    // Aqui, você faria a gravação no banco de dados. Exemplo fictício:
    await this.prismaService.coleta.createMany({
      data: registros,
    });
    console.log('Dados processados e salvos com sucesso.');
    // Retornar os registros processados para fins de debug ou confirmação
    return {
      message: 'Dados processados e salvos com sucesso.',
      data: registros,
    };
  }

  universal_decolar(jsonData: object[]): any {
    let dataList = jsonData; // Recebe a lista de objetos JSON enviada na solicitação

    // Trim 'Parque' field in each item
    dataList = dataList.map((item) => ({
      ...item,
      Parque: item['Parque'].trim(),
    }));

    // Mapeamento dos nomes dos parques
    const mapping = {
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

    // Filtrar a lista de dados com base nos parques válidos
    let filteredDataList = dataList.filter((item) => mapping[item['Parque']]);

    // Atualiza os nomes dos parques de acordo com o mapeamento
    filteredDataList = filteredDataList.map((item) => ({
      ...item,
      Parque: mapping[item['Parque']],
    }));

    // Ordenar os dados por 'Data_viagem' e 'Parque'
    filteredDataList = _.orderBy(
      filteredDataList,
      ['Data_viagem', 'Parque'],
      ['asc', 'asc'],
    );

    // Atualizar o preço à vista (97% do preço parcelado)
    filteredDataList = filteredDataList.map((item) => ({
      ...item,
      Preco_Avista: item['Preco_Parcelado'] * 0.97,
    }));

    // Agrupar os dados por 'Data_viagem'
    const groupedData = _.groupBy(filteredDataList, 'Data_viagem');

    // Formatar os dados no formato especificado
    const formattedData = [];
    _.forEach(groupedData, (value, key) => {
      value.forEach((item) => {
        formattedData.push({
          Data_viagem: key,
          Parque: item.Parque,
          Preco_Parcelado: item.Preco_Parcelado,
          Preco_Avista: item.Preco_Avista,
        });
      });
    });

    // Simular gravação do arquivo (aqui só retornamos o nome do arquivo e os dados)
    //const fileName = `universal_decolar_${data_atual}.json`;

    return formattedData;
  }
}
