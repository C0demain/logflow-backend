import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID } from "class-validator";
import { Sector } from "src/modules/service-order/enums/sector.enum";

export class CreateTaskDto {

    @IsString()
    @IsNotEmpty()
    title: string

    @IsUUID()
    @IsNotEmpty()
    orderId: string

    @IsOptional()
    @IsUUID()
    userId: string

    @IsEnum(Sector)
    sector: Sector

    @IsOptional()
    driverChecklists: {
        produto_coletado: string;
        saida_para_entrega: string;
        chegada_do_produto: string;
        coleta_de_assinatura: string;
    }
}
