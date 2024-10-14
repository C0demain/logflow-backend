import { Sector } from "src/modules/service-order/enums/sector.enum"
import { Task } from "src/modules/task/entities/task.entity"

export class GetTaskDto {
    readonly id: string;
    readonly title: string;
    readonly sector: Sector;
    readonly completed: boolean;
    readonly serviceOrder: {
        id: string,
        title: string
    };
    readonly assignedUser: {
        id: string,
        name: string,
        email: string
    };
    readonly driverInfo?: {
        id: string,
        name: string,
        email: string
    };
    readonly clientInfo?: {
        id: string,
        name: string,
        email: string,
        address?: {
            zipCode: string,
            state: string,
            city: string,
            neighborhood: string,
            street: string,
            number: string,
            complement?: string
        }
    };

    constructor(
        id: string,
        title: string,
        sector: Sector,
        completed: boolean,
        serviceOrder: {
            id: string,
            title: string
        },
        assignedUser: {
            id: string,
            name: string,
            email: string
        },
        driverInfo?: {
            id: string,
            name: string,
            email: string
        },
        clientInfo?: {
            id: string,
            name: string,
            email: string,
            address?: {
                zipCode: string,
                state: string,
                city: string,
                neighborhood: string,
                street: string,
                number: string,
                complement?: string
            }
        }
    ) {
        this.id = id;
        this.title = title;
        this.completed = completed;
        this.sector = sector;
        this.assignedUser = assignedUser;
        this.serviceOrder = serviceOrder;
        this.driverInfo = driverInfo;
        this.clientInfo = clientInfo;
    };
}

export function parseToGetTaskDTO(task: Task): GetTaskDto {
    const serviceOrder = {
        id: task.serviceOrder.id,
        title: task.serviceOrder.title,
    };

    const assignedUser = {
        id: task.assignedUser.id,
        name: task.assignedUser.name,
        email: task.assignedUser.email,
    };

    const driverInfo = task.driver ? 
    {
        id: task.driver.id,
        name: task.driver.name,
        email: task.driver.email,
    } 
    : undefined;

    const clientInfo = task.client ? 
    {
        id: task.client.id,
        name: task.client.name,
        email: task.client.email,
        address: task.client.address ? {
            zipCode: task.client.address.zipCode,
            state: task.client.address.state,
            city: task.client.address.city,
            neighborhood: task.client.address.neighborhood,
            street: task.client.address.street,
            number: task.client.address.number,
            complement: task.client.address.complement
        } : undefined
    }
    : undefined;
    
    return new GetTaskDto(
        task.id, 
        task.title, 
        task.sector, 
        task.completed, 
        serviceOrder, 
        assignedUser, 
        driverInfo,
        clientInfo
    );
} 