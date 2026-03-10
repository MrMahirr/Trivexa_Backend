import { Type } from 'class-transformer';
import { IsArray, IsOptional, IsString, ValidateNested } from 'class-validator';

export class LandingHeroDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  subtitle?: string;

  @IsOptional()
  @IsString()
  ctaLabel?: string;

  @IsOptional()
  @IsString()
  ctaLink?: string;

  @IsOptional()
  @IsString()
  backgroundImage?: string;
}

export class LandingIntroDto {
  @IsOptional()
  @IsString()
  label?: string;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  paragraphs?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tickerTexts?: string[];
}

export class LandingServiceItemDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;
}

export class LandingServicesDto {
  @IsOptional()
  @IsString()
  label?: string;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LandingServiceItemDto)
  items?: LandingServiceItemDto[];
}

export class LandingProcessStepDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;
}

export class LandingProcessDto {
  @IsOptional()
  @IsString()
  label?: string;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LandingProcessStepDto)
  steps?: LandingProcessStepDto[];
}

export class LandingStatDto {
  @IsOptional()
  @IsString()
  value?: string;

  @IsOptional()
  @IsString()
  label?: string;
}

export class LandingImpactDto {
  @IsOptional()
  @IsString()
  label?: string;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  ctaLabel?: string;

  @IsOptional()
  @IsString()
  ctaLink?: string;

  @IsOptional()
  @IsString()
  backgroundColor?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LandingStatDto)
  stats?: LandingStatDto[];
}

export class LandingContactDto {
  @IsOptional()
  @IsString()
  label?: string;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  image?: string;
}

export class LandingContentDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => LandingHeroDto)
  hero?: LandingHeroDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => LandingIntroDto)
  intro?: LandingIntroDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => LandingServicesDto)
  services?: LandingServicesDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => LandingProcessDto)
  process?: LandingProcessDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => LandingImpactDto)
  impact?: LandingImpactDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => LandingContactDto)
  contact?: LandingContactDto;
}
