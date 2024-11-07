import { IsNotEmpty, IsString } from "class-validator";

export class CreateProcessDto {

    @IsString()
    @IsNotEmpty()
    title: string
}
