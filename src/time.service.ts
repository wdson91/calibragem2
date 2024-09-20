import { Injectable, OnModuleInit } from '@nestjs/common';
import { format, toZonedTime } from 'date-fns-tz';
@Injectable()
export class TimeService implements OnModuleInit {
  private arrayDatas: number[];
  private dataAtual: string;

  async onModuleInit() {
    console.log('Aplicação iniciada! Rodando função inicial...');
    this.setHoraGlobal();
  }
  constructor() {
    // Definindo valores iniciais
    this.arrayDatas = [1, 2, 3]; // Exemplo de datas
    this.dataAtual = new Date().toISOString().split('T')[0];
  }
  horaGlobal = '';
  // Getter para horaGlobal que retorna a hora atual dinamicamente
  getHoraGlobal(): any {
    console.log('Hora Global:', this.horaGlobal);
    return this.horaGlobal;
  }

  setHoraGlobal(): void {
    const timeZone = 'America/Sao_Paulo'; // GMT-3

    // Obtém a data/hora atual em UTC
    const nowUtc = new Date();

    // Converte para o horário da zona especificada
    const nowZoned = toZonedTime(nowUtc, timeZone);

    // Formata a hora e minuto no formato desejado
    this.horaGlobal = format(nowZoned, 'HH:mm', { timeZone });

    return;
  }

  // Getter e Setter para arrayDatas
  getArrayDatas(): number[] {
    return this.arrayDatas;
  }

  setArrayDatas(datas: number[]): void {
    this.arrayDatas = datas;
  }

  // Getter e Setter para dataAtual
  getDataAtual(): string {
    return this.dataAtual;
  }

  setDataAtual(data: string): void {
    this.dataAtual = data;
  }

  // Método para gerar datas futuras [5, 10, 20, 47, 65, 126]

  gerarDatasFuturas(): string[] {
    const dias = [5, 10, 20, 47, 65, 126];
    const datasFuturas: string[] = [];

    const hoje = new Date(); // Data atual

    dias.forEach((diasFuturos) => {
      const dataFutura = new Date(hoje); // Cria uma cópia da data atual
      dataFutura.setDate(hoje.getDate() + diasFuturos); // Adiciona os dias futuros
      const dataFormatada = dataFutura.toISOString().split('T')[0];
      datasFuturas.push(dataFormatada); // Adiciona a data formatada ao array
    });

    return datasFuturas;
  }

  // Método para ajustar a hora para GMT-3

  adjustToGMTMinus3 = (time: string): Date => {
    // Cria uma data baseada na hora fornecida
    const date = new Date(`${this.dataAtual}T${time}:00Z`); // A data padrão é UTC
    // Ajusta a data para GMT-3 (diferença de -3 horas)
    date.setHours(date.getHours());
    return date;
  };
}
