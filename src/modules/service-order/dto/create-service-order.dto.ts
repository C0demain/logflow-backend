import { IsDate, IsEnum, IsNotEmpty, IsString, IsUUID} from "class-validator";
import { Status } from "../enums/status.enum";
import { IsFutureDate } from "src/resources/pipes/futureDateValidator";
import { Transform } from "class-transformer";

export class CreateServiceOrderDto {

    @IsString()
    @IsNotEmpty({message: "o titulo nao pode estar vazio"})
    title: string;

    @IsString()
    clientRelated: string;

    @IsDate()
    @Transform(({ value }) => {
        const [day, month, year] = value.split('/');
        return new Date(`${year}-${month}-${day}`);
      })
    @IsFutureDate({message:"a data de expiração precisa ser no futuro"})
    expirationDate: Date;

    @IsEnum(Status, {message: 'o status precisa estar dentro dos padrões pré-definidos'})
    status: Status;

    @IsUUID()
    @IsNotEmpty({ message: "O ID do usuário é obrigatório" })
    userId: string; 
}
