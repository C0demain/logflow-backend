import { IsInt, IsNotEmpty, IsNumber, IsString, Length, Max, Min } from "class-validator";

export class CreateVehicleDto {
    @IsString()
    @IsNotEmpty({ message: "O campo 'Placa' não pode estar vazio." })
    @Length(7, 7, { message: "O campo 'Placa' deve ter exatamente 7 caracteres." })
    plate: string;
  
    @IsString()
    @IsNotEmpty({ message: "O campo 'Modelo' não pode estar vazio." })
    @Length(1, 50, { message: "O campo 'Modelo' deve ter entre 1 e 50 caracteres." })
    model: string;
  
    @IsString()
    @IsNotEmpty({ message: "O campo 'Marca' não pode estar vazio." })
    @Length(1, 50, { message: "O campo 'Marca' deve ter entre 1 e 50 caracteres." })
    brand: string;
  
    @IsInt()
    @Min(1900, { message: "O campo 'Ano' deve ser maior ou igual a 1900." })
    @Max(new Date().getFullYear(), { message: "O campo 'Ano' não pode ser no futuro." })
    year: number;
  
    @IsNumber()
    @Min(0, { message: "O campo 'Autonomia' deve ser maior ou igual a 0." })
    autonomy: number;
  
    @IsString()
    @IsNotEmpty({ message: "O campo 'Status' não pode estar vazio." })
    status: string;
  }