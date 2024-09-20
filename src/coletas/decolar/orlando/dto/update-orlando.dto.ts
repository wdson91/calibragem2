import { PartialType } from '@nestjs/mapped-types';
import { CreateOrlandoDto } from './create-orlando.dto';

export class UpdateOrlandoDto extends PartialType(CreateOrlandoDto) {
  id: number;
}
