import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsOptional,
  IsUrl,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateLinkDto {
  @ApiProperty({ example: 'https://www.example.com/artigos/introducao' })
  @IsUrl({ require_protocol: true })
  @MaxLength(2048)
  original!: string;

  @ApiPropertyOptional({
    description:
      'Slug personalizado opcional. Aceita letras sem acento, números e hífens; será convertido para minúsculas.',
    example: 'meu-artigo-2026',
    minLength: 3,
    maxLength: 50,
  })
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @IsOptional()
  @MinLength(3)
  @MaxLength(50)
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
  customCode?: string;
}
