import {
  IsString,
  IsOptional,
  IsNumber,
  IsEmail,
  MaxLength,
  Min,
  Matches,
  IsArray,
  ValidateNested,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';
import { TypesAnnonce, Villes, UploadedImageDto } from './create-announce.dto';

export class UpdateAnnounceDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  titre?: string;

  @IsOptional()
  @IsEnum(TypesAnnonce, {
    message: 'Le type doit être VENTE, LOCATION ou SERVICE',
  })
  type?: TypesAnnonce;

  @IsOptional()
  @IsNumber()
  @Min(0)
  prix?: number;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @IsOptional()
  @IsEnum(Villes, {
    message: 'La ville doit être YAOUNDE, DOUALA ou DSCHANG',
  })
  ville?: Villes;

  @IsOptional()
  @IsString()
  quartier?: string;

  @IsOptional()
  @IsString()
  @Matches(/^\+237 6\d{2} \d{2} \d{2} \d{2}$/, {
    message: 'Le numéro doit respecter le format +237 6XX XX XX XX',
  })
  telephone?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UploadedImageDto)
  uploadedImages?: UploadedImageDto[];
}
