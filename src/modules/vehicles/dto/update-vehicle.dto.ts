import { IsInt, IsNumber, IsOptional, IsString, Length, Max, Min } from "class-validator";

export class UpdateVehicleDto {
    @IsOptional()
    @IsString()
    @Length(7, 7, { message: "O campo 'Placa' deve ter exatamente 7 caracteres." })
    plate?: string;
  
    @IsOptional()
    @IsString()
    @Length(1, 50, { message: "O campo 'Modelo' deve ter entre 1 e 50 caracteres." })
    model?: string;
  
    @IsOptional()
    @IsString()
    @Length(1, 50, { message: "O campo 'Marca' deve ter entre 1 e 50 caracteres." })
    brand?: string;
  
    @IsOptional()
    @IsInt()
    @Min(1900, { message: "O campo 'Ano' deve ser maior ou igual a 1900." })
    @Max(new Date().getFullYear(), { message: "O campo 'Ano' não pode ser no futuro." })
    year?: number;
  
    @IsOptional()
    @IsNumber()
    @Min(0, { message: "O campo 'Autonomia' deve ser maior ou igual a 0." })
    autonomy?: number;
  
    @IsOptional()
    @IsString()
    status?: string;
  }