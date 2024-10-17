import { Type } from 'class-transformer';
import { IsString, IsNotEmpty, Length, IsEmail, ValidateNested } from 'class-validator';
import { UniqueEmail } from 'src/modules/user/validation/UniqueEmail.validation';
import { IsCNPJ } from '../validations/brazilianCNPJValidator';
import { IsBrazilianPhoneNumber } from '../validations/brazilianPhoneNumberValidator';
import { AddressDto } from './address.dto';

export class UpdateClientDto {
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

    @ValidateNested()
    @Type(() => AddressDto)
    address: AddressDto;
}
