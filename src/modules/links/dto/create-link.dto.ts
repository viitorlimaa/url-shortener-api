import { IsUrl, MaxLength } from 'class-validator';

export class CreateLinkDto {
  @IsUrl({ require_protocol: true })
  @MaxLength(2048)
  original!: string;
}
