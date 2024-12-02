import { IsInt, IsNumber, IsOptional, IsString } from "class-validator";

export class FilterVehicleDto {
    @IsOptional()
    @IsString()
    plate?: string;
  
    @IsOptional()
    @IsString()
    model?: string;
  
    @IsOptional()
    @IsString()
    brand?: string;
  
    @IsOptional()
    @IsInt()
    yearFrom?: number;
  
    @IsOptional()
    @IsInt()
    yearTo?: number;
  
    @IsOptional()
    @IsNumber()
    autonomyFrom?: number;
  
    @IsOptional()
    @IsNumber()
    autonomyTo?: number;
  
    @IsOptional()
    @IsString()
    status?: string;
  }