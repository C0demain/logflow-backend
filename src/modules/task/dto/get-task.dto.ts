import { Sector } from "src/modules/service-order/enums/sector.enum"
import { Task } from "src/modules/task/entities/task.entity"

export class GetTaskDto {
    readonly id: string;
    readonly title: string;
    readonly sector: Sector;
    readonly completed: boolean;
    readonly serviceOrder?: {
        id: string,
        title: string
    };
    readonly assignedUser?: {
        id: string,
        name: string,
        email: string
    };
    readonly address?: {
        zipCode: string,
        state: string,
        city: string,
        neighborhood: string,
        street: string,
        number: string,
        complement?: string,
    }

    constructor(
        id: string,
        title: string,
        sector: Sector,
        completed: boolean,
        assignedUser?: {
            id: string,
            name: string,
            email: string
        },
        serviceOrder?: {
            id: string,
            title: string
        },
        address?: {
            zipCode: string,
            state: string,
            city: string,
            neighborhood: string,
            street: string,
            number: string,
            complement?: string,
        }
        
    ) {
        this.id = id;
        this.title = title;
        this.completed = completed;
        this.sector = sector;
        this.assignedUser = assignedUser;
        this.serviceOrder = serviceOrder;
        this.address = address;
    };
}

export function parseToGetTaskDTO(task: Task): GetTaskDto {
    const serviceOrder = task.serviceOrder ? {
        id: task.serviceOrder.id,
        title: task.serviceOrder.title,
    } : undefined;

    const assignedUser = task.assignedUser ? {
        id: task.assignedUser.id,
        name: task.assignedUser.name,
        email: task.assignedUser.email,
    } : {
        id: "null",
        name: "nenhum usuário atribuído a esta tarefa",
        email: "null",
    };

    const address = task.address ? {
        zipCode: task.address.zipCode,
        state: task.address.state,
        city: task.address.city,
        neighborhood: task.address.neighborhood,
        street: task.address.street,
        number: task.address.number,
        complement: task.address.complement,
    } : undefined;
    
    return new GetTaskDto(
        task.id, 
        task.title, 
        task.sector, 
        task.completed, 
        assignedUser, 
        serviceOrder, 
        address
    );
}