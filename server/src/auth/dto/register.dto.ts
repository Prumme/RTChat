import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({
    description: 'The email of the user',
    example: 'johnsmith@mail.fr',
    required: true,
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'The color of the user',
    example: 'Shadow',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  pseudo: string;

  @ApiProperty({
    description: 'the password of the user',
    example: 'EminenceInShadow123',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  password: string;
}
