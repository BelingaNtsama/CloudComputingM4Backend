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

// Enum pour type d’annonce
export enum TypesAnnonce {
  VENTE = 'VENTE',
  LOCATION = 'LOCATION',
  SERVICE = 'SERVICE',
}

// Enum pour villes (exemple)
export enum Villes {
  YAOUNDE = 'YAOUNDE',
  DOUALA = 'DOUALA',
  DSCHANG = 'DSCHANG',
}

export class UploadedImageDto {
  @IsString()
  url: string;

  @IsOptional()
  @IsString()
  description?: string;
}

export class CreateAnnounceDto {
  @IsString()
  @MaxLength(100)
  titre: string;

  @IsEnum(TypesAnnonce, {
    message: 'Le type doit être VENTE, LOCATION ou SERVICE',
  })
  type: TypesAnnonce;

  @IsOptional()
  @IsNumber()
  @Min(0)
  prix?: number;

  @IsString()
  @MaxLength(1000)
  description: string;

  @IsEnum(Villes, {
    message: 'La ville doit être YAOUNDE, DOUALA ou DSCHANG',
  })
  ville: Villes;

  @IsOptional()
  @IsString()
  quartier?: string;

  @IsString()
  @Matches(/^\+237 6\d{2} \d{2} \d{2} \d{2}$/, {
    message: 'Le numéro doit respecter le format +237 6XX XX XX XX',
  })
  telephone: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UploadedImageDto)
  uploadedImages?: UploadedImageDto[];
}
