import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsArray, ArrayNotEmpty } from 'class-validator';

export class CreateGroupDto {
  @ApiProperty({
    description: 'Liste des IDs des utilisateurs qui participent au groupe',
    type: [String],
    example: [
      '38ab9ab5-27e5-4468-9de3-3200c3552e2d',
      'b53012a0-91a2-460a-9053-5992f149f0b9',
    ],
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsUUID('all', { each: true })
  participants: string[];
}
