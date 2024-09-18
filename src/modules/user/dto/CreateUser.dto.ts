import { IsEmail, IsNotEmpty, MinLength } from "class-validator";
import { UniqueEmail } from "../validation/UniqueEmail.validation";

export class CreateUserDTO {
  @IsNotEmpty({ message: "O campo `name` não pode ser vazio" })
  name: string;

  @IsEmail(undefined, { message: "O campo `email` informado é inválido ou não foi informado" })
  @UniqueEmail({message:"Já existe um usuário com este email."})
  email: string;

  @MinLength(6, { message: "O campo `password` precisa ter pelo menos 6 caracteres" })
  password: string;
}