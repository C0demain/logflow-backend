import { IsString, IsNotEmpty, IsIn, IsOptional } from 'class-validator';

export class AddressDto {
    @IsString()
    @IsNotEmpty({ message: "O campo 'CEP' não pode estar vazio." })
    zipCode: string;

    @IsString()
    @IsOptional()
    state: string;

    @IsString()
    @IsOptional()
    city: string;

    @IsString()
    @IsOptional()
    neighborhood: string;

    @IsString()
    @IsOptional()
    @IsIn(
        [
            'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 
            'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 
            'RR', 'SC', 'SP', 'SE', 'TO'
        ],
        { message: "O campo 'Estado' deve ser uma sigla de estado válida" }
    )
    street: string;

    @IsString()
    @IsNotEmpty({ message: "O campo 'Número' não pode estar vazio." })
    number: string;

    @IsString()
    complement?: string;
}
