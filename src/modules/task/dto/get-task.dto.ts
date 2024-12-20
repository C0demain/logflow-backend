import { Sector } from "src/modules/service-order/enums/sector.enum"
import { Task } from "src/modules/task/entities/task.entity"
import { TaskStage } from "../enums/task.stage.enum";

export class GetTaskDto {
    readonly id: string;
    readonly title: string;
    readonly sector: Sector;
    readonly startedAt: Date | null;
    readonly completedAt: Date | null;
    readonly dueDate?: Date | null;
    readonly stage: TaskStage;
    readonly taskCost: number | null;
    readonly serviceOrder?: {
        id: string,
        code: string
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
    readonly files?: Array<{
        id: string,
        filename: string,
    }>
    readonly vehicle?:{
        plate: string,
        brand: string,
        model: string
    }

    constructor(
        id: string,
        title: string,
        startedAt: Date | null,
        completedAt: Date | null,
        dueDate: Date | null,
        sector: Sector,
        stage: TaskStage,
        taskCost: number | null,
        assignedUser?: {
            id: string,
            name: string,
            email: string
        },
        serviceOrder?: {
            id: string,
            code: string
        },
        address?: {
            zipCode: string,
            state: string,
            city: string,
            neighborhood: string,
            street: string,
            number: string,
            complement?: string,
        },
        files?: Array<{
            id: string,
            filename: string,
        }>,
        vehicle?:{
            plate: string,
            brand: string,
            model: string
        }
        
    ) {
        this.id = id;
        this.title = title;
        this.startedAt = startedAt;
        this.completedAt = completedAt;
        this.dueDate = dueDate;
        this.sector = sector;
        this.stage = stage;
        this.taskCost = taskCost;
        this.assignedUser = assignedUser;
        this.serviceOrder = serviceOrder;
        this.address = address;
        this.files = files
        this.vehicle = vehicle;
    };
}

export function parseToGetTaskDTO(task: Task): GetTaskDto {
    const serviceOrder = task.serviceOrder ? {
        id: task.serviceOrder.id,
        code: task.serviceOrder.code,
    } : undefined;

    const assignedUser = task.assignedUser ? {
        id: task.assignedUser.id,
        name: task.assignedUser.name,
        email: task.assignedUser.email,
    } : {
        id: "null",
        name: "Nenhum usuário atribuído a esta tarefa",
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

    const files = task.files && task.files.map(f => {
        return {
            id: f.id,
            filename: f.filename,
        }
    })

    const vehicle = task.vehicle?{
        plate: task.vehicle.plate,
        brand: task.vehicle.brand,
        model: task.vehicle.model

    }: undefined
    
    return new GetTaskDto(
        task.id, 
        task.title, 
        task.startedAt, 
        task.completedAt,
        task.dueDate, 
        task.sector,
        task.stage,
        task.taskCost,
        assignedUser, 
        serviceOrder, 
        address,
        files,
        vehicle

    );
}