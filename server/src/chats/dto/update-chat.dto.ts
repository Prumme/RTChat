import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class UpdateChatDto {
  @IsOptional()
  @IsString()
  message?: string;

  @IsOptional()
  @IsBoolean()
  isEdited?: boolean;
}
