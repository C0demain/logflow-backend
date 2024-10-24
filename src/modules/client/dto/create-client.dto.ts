import { IsString, IsNotEmpty, IsEmail, Length, IsIn, ValidateNested } from "class-validator";
import { UniqueEmail } from "src/modules/user/validation/UniqueEmail.validation";
import { IsBrazilianPhoneNumber } from "src/modules/client/validations/brazilianPhoneNumberValidator";
import { IsCNPJ } from "src/modules/client/validations/brazilianCNPJValidator";
import { Type } from "class-transformer";
import { AddressDto } from "./address.dto";

export class CreateClientDto {

    @IsString()
    @IsNotEmpty({ message: "O campo 'Nome' não pode estar vazio." })
    @Length(1, 100, { message: "O campo 'Nome' deve ter entre 1 e 100 caracteres" })
    name: string;

    @IsString()
    @IsNotEmpty({ message: "O campo 'Telefone' não pode estar vazio." })
    @IsBrazilianPhoneNumber()
    phone: string;

    @IsString()
    @IsNotEmpty({ message: "O campo 'CNPJ' não pode estar vazio." })
    @IsCNPJ()
    cnpj: string;

    @IsEmail({}, { message: "O campo 'Email' deve ser um e-mail válido." })
    @IsNotEmpty({ message: "O campo 'Email' não pode estar vazio." })
    @Length(1, 40, { message: "O campo 'Email' deve possuir no máximo 40 caracteres." })
    @UniqueEmail({ message: "Email já associado a um usuário ou cliente." })
    email: string;

    @ValidateNested()
    @Type(() => AddressDto)
    address: AddressDto;
}