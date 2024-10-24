import { IsNotEmpty, IsEmail, MinLength, IsOptional, IsEnum, IsBoolean, IsSemVer, IsString } from "class-validator";
import { RoleEntity } from "src/modules/roles/roles.entity";
import { Sector } from "src/modules/service-order/enums/sector.enum";

export class UpdateUserDTO{
    @IsNotEmpty({ message: 'O campo `name` não pode ser vazio.' })
    name: string;

    @IsEmail(undefined, {message: 'O campo `email` informado é inválido ou não foi informado.',})
    email: string;

    @IsOptional()
    @MinLength(6, {message: 'O campo `password` precisa ter pelo menos 6 caracteres.',})
    password?: string;

    @IsOptional()
    @IsString()
    role?: string;

    @IsOptional()
    @IsEnum(Sector, {message: 'O campo `sector` precisa estar dentro dos padrôes estabelecidos.',})
    sector?: Sector;

    @IsOptional()
    @IsBoolean({ message: 'O campo `isActive` precisa ser `true` ou `false`.' })
    isActive?: boolean;
}