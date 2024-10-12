import { BadRequestException } from "@nestjs/common";
import { Task } from "src/modules/task/entities/task.entity";

export class TaskValidator {
    
    static validate(task: Task): void {

        if (task.departureForDelivery && !task.collectProduct) {
            throw new BadRequestException(
                'Coleta do produto deve ser finalizada antes de sair para entrega.'
            );
        }
        if (task.arrival && !task.departureForDelivery) {
            throw new BadRequestException(
                'Saída para entrega deve ser finalizada antes da chegada.'
            );
        }
        if (task.collectSignature && !task.arrival) {
            throw new BadRequestException(
                'Chegada deve ser finalizada antes de coletar a assinatura.'
            );
        }
    }
}