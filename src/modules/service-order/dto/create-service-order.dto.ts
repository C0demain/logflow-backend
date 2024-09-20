import { IsEnum, IsNotEmpty, IsString, IsUUID} from "class-validator";
import { Status } from "../enums/status.enum";
import { Sector } from "../enums/sector.enum";

export class CreateServiceOrderDto {

    @IsString()
    @IsNotEmpty({message: "o titulo nao pode estar vazio"})
    title: string;

    @IsString()
    clientRelated: string;

    @IsEnum(Status, {message: 'o campo `status` precisa estar dentro dos padrões pré-definidos'})
    status: Status;

    @IsEnum(Status, {message: 'o campo `sector` precisa estar dentro dos padrões pré-definidos'})
    sector: Sector;

    @IsUUID()
    @IsNotEmpty({ message: "O ID do usuário é obrigatório" })
    userId: string; 
}
