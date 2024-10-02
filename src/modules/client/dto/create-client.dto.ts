import { IsString, IsNotEmpty, IsEmail, Length, IsIn } from "class-validator";
import { UniqueEmail } from "src/modules/user/validation/UniqueEmail.validation";
import { IsBrazilianPhoneNumber } from "src/resources/validations/brazilianPhoneNumberValidator";
import { IsZipCode } from "src/resources/validations/brazilianZipCodeValidation";
import { IsCNPJ } from "src/resources/validations/brazilianCNPJValidator";

export class CreateClientDto {

    @IsString()
    @IsNotEmpty({ message: "O campo `name` não pode estar vazio" })
    @Length(1, 100, { message: "O campo `name` deve ter entre 1 e 100 caracteres" })
    name: string;

    @IsString()
    @IsNotEmpty({ message: "O campo `phone` não pode estar vazio" })
    @IsBrazilianPhoneNumber()
    phone: string;

    @IsString()
    @IsNotEmpty({ message: "O campo `cnpj` não pode estar vazio" })
    @IsCNPJ()
    cnpj: string;

    @IsEmail({}, { message: "O campo `email` deve ser um e-mail válido" })
    @IsNotEmpty({ message: "O campo `email` não pode estar vazio" })
    @Length(1, 40, { message: "O campo `email` deve ter até 40 caracteres" })
    @UniqueEmail({ message: 'Já existe um usuário ou um cliente com este email.' })
    email: string;

    @IsString()
    @IsNotEmpty({message: 'o campo `zipCode` não pode estar vazio'})
    @IsZipCode()
    zipCode: string;

    @IsString()
    @IsNotEmpty({ message: "O campo `state` não pode estar vazio" })
    @IsIn(['AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 
        'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 
        'RR', 'SC', 'SP', 'SE', 'TO'], 
        { message: "O campo `state` deve ser uma sigla de estado válida" })
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
