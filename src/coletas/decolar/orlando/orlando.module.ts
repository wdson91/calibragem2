import { Module } from '@nestjs/common';
import { DisneyDecolarService } from './orlando.service';
import { OrlandoController } from './orlando.controller';
import { PrismaService } from 'src/prisma.service';
import { TimeService } from 'src/time.service';
import { HttpModule } from '@nestjs/axios';
import { DecolarService } from './decolar.service';
import { AzureBlobStorageService } from 'src/blob/blob.service';
@Module({
  imports: [HttpModule],
  controllers: [OrlandoController],
  providers: [
    DisneyDecolarService,
    PrismaService,
    TimeService,
    DecolarService,
    AzureBlobStorageService,
  ],
})
export class OrlandoModule { }
