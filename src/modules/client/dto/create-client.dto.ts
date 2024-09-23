import { IsString, IsNotEmpty, IsEmail, IsUUID, Length } from "class-validator";

export class CreateClientDto {

    @IsUUID()
    id: string;

    @IsString()
    @IsNotEmpty({ message: "O campo `name` não pode estar vazio" })
    @Length(1, 100, { message: "O campo `name` deve ter entre 1 e 100 caracteres" })
    name: string;

    @IsString()
    @IsNotEmpty({ message: "O campo `telefone` não pode estar vazio" })
    @Length(10, 12, { message: "O campo `telefone` deve ter entre 10 e 12 caracteres" })
    telefone: string;

    @IsString()
    @IsNotEmpty({ message: "O campo `cnpj` não pode estar vazio" })
    @Length(14, 15, { message: "O campo `cnpj` deve ter entre 14 e 15 caracteres" })
    cnpj: string;

    @IsEmail({}, { message: "O campo `email` deve ser um e-mail válido" })
    @IsNotEmpty({ message: "O campo `email` não pode estar vazio" })
    @Length(1, 40, { message: "O campo `email` deve ter até 40 caracteres" })
    email: string;

    @IsString()
    @IsNotEmpty({message: 'o campo `cep` não pode estar vazio'})
    cep: string;

    @IsString()
    @IsNotEmpty({ message: "O campo `estado` não pode estar vazio" })
    estado: string;

    @IsString()
    @IsNotEmpty({ message: "O campo `cidade` não pode estar vazio" })
    cidade: string;

    @IsString()
    @IsNotEmpty({ message: "O campo `bairro` não pode estar vazio" })
    bairro: string;

    @IsString()
    @IsNotEmpty({ message: "O campo `rua` não pode estar vazio" })
    rua: string;

    @IsString()
    @IsNotEmpty({ message: "O campo `numero` não pode estar vazio" })
    numero: string;

    @IsString()
    complemento?: string;
}
