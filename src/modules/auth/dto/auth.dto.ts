import { IsEmail, IsNotEmpty } from "class-validator";

export class AuthDTO {
    @IsEmail(undefined, { message: "O `email` informado é inválido" })
    email: string;

    @IsNotEmpty({ message: "O campo `password` não pode estar vazio" })
    password: string;
}