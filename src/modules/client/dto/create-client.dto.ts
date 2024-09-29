import { IsString, IsNotEmpty, IsEmail, IsUUID, Length } from "class-validator";
import { UniqueEmail } from "src/modules/user/validation/UniqueEmail.validation";

export class CreateClientDto {

    @IsString()
    @IsNotEmpty({ message: "O campo `name` não pode estar vazio" })
    @Length(1, 100, { message: "O campo `name` deve ter entre 1 e 100 caracteres" })
    name: string;

    @IsString()
    @IsNotEmpty({ message: "O campo `phone` não pode estar vazio" })
    @Length(10, 12, { message: "O campo `phone` deve ter entre 10 e 12 caracteres" })
    phone: string;

    @IsString()
    @IsNotEmpty({ message: "O campo `cnpj` não pode estar vazio" })
    @Length(14, 15, { message: "O campo `cnpj` deve ter entre 14 e 15 caracteres" })
    cnpj: string;

    @IsEmail({}, { message: "O campo `email` deve ser um e-mail válido" })
    @IsNotEmpty({ message: "O campo `email` não pode estar vazio" })
    @Length(1, 40, { message: "O campo `email` deve ter até 40 caracteres" })
    @UniqueEmail({ message: 'Já existe um usuário ou um cliente com este email.' })
    email: string;

    @IsString()
    @IsNotEmpty({message: 'o campo `zipCode` não pode estar vazio'})
    zipCode: string;

    @IsString()
    @IsNotEmpty({ message: "O campo `state` não pode estar vazio" })
    state: string;

    @IsString()
    @IsNotEmpty({ message: "O campo `city` não pode estar vazio" })
    city: string;

    @IsString()
    @IsNotEmpty({ message: "O campo `neighborhood` não pode estar vazio" })
    neighborhood: string;

    @IsString()
    @IsNotEmpty({ message: "O campo `street` não pode estar vazio" })
    street: string;

    @IsString()
    @IsNotEmpty({ message: "O campo `number` não pode estar vazio" })
    number: string;

    @IsString()
    complement?: string;
}
