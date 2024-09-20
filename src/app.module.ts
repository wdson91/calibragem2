import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BullModule } from '@nestjs/bull';

import { OrlandoModule } from './coletas/decolar/orlando/orlando.module';
import { DisneyDecolarService } from './coletas/decolar/orlando/orlando.service';
import { PrismaService } from './prisma.service';
import { TimeService } from './time.service';

@Module({
  imports: [
    // Configurando Redis globalmente para todas as filas
    BullModule.forRoot({
      redis: {
        host: 'localhost',
        port: 6379,
      },
      defaultJobOptions: {
        removeOnComplete: 100, // Remover até 100 jobs completos
        removeOnFail: 100, // Remover até 100 jobs que falharam
        attempts: 3, // Tentar até 3 vezes em caso de falha
        backoff: {
          type: 'exponential', // Backoff exponencial em caso de falha
          delay: 1000, // Tempo de espera entre as tentativas
        },
      },
    }),

    // Registrando a fila "coletar-precos"
    BullModule.registerQueue({
      name: 'coletar-precos',
      // A configuração Redis é herdada do forRoot(), não precisa ser repetida
    }),

    OrlandoModule,
  ],
  controllers: [AppController],
  providers: [AppService, DisneyDecolarService, PrismaService, TimeService],
})
export class AppModule { }
