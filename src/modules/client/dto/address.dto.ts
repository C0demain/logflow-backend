import { IsString, IsNotEmpty, IsIn } from 'class-validator';

export class AddressDto {
    @IsString()
    @IsNotEmpty({ message: "O campo 'CEP' não pode estar vazio." })
    zipCode: string;

    @IsString()
    @IsNotEmpty({ message: "O campo 'Estado' não pode estar vazio." })
    @IsIn(['AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 
        'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 
        'RR', 'SC', 'SP', 'SE', 'TO'], 
        { message: "O campo 'Estado' deve ser uma sigla de estado válida" })
    state: string;

    @IsString()
    @IsNotEmpty({ message: "O campo 'Cidade' não pode estar vazio." })
    city: string;

    @IsString()
    @IsNotEmpty({ message: "O campo 'Bairro' não pode estar vazio." })
    neighborhood: string;

    @IsString()
    @IsNotEmpty({ message: "O campo 'Rua' não pode estar vazio." })
    street: string;

    @IsString()
    @IsNotEmpty({ message: "O campo 'Número' não pode estar vazio." })
    number: string;

    @IsString()
    complement?: string;
}
