import { IsArray, IsNumber, IsOptional, IsString, Max, Min } from "class-validator";

export class VisitCheckRequestDto {
  @IsString()
  userId!: string;

  @IsNumber()
  lat!: number;

  @IsNumber()
  lng!: number;

  @IsOptional()
  @IsNumber()
  @Min(10)
  @Max(1000)
  radiusM?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  excludePlaceIds?: string[];
}
