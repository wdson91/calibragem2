import { Controller, Get } from '@nestjs/common';
import { DecolarService } from './decolar.service';

@Controller()
export class OrlandoController {
  constructor(private readonly decolar: DecolarService) { }

  @Get('decolar')
  async coletarPrecos(): Promise<void> {
    await this.decolar.getActivities();
  }
}
