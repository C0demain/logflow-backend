import { IsNotEmpty, IsString, IsUUID } from "class-validator";

export class CreateTaskDto {

    @IsString()
    @IsNotEmpty()
    title: string

    @IsUUID()
    @IsNotEmpty()
    orderId: string
}
