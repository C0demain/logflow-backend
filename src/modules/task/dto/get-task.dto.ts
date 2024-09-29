import { Sector } from "src/modules/service-order/enums/sector.enum"
import { Task } from "src/modules/task/entities/task.entity"

export class GetTaskDto{
    readonly id: string
    readonly title: string
    readonly sector: Sector
    readonly completed: boolean
    readonly serviceOrder: {
        id: string,
        title: string
    }
    readonly assignedUser: {
        id: string,
        name: string,
        email: string
    }

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
        }
    ){
        this.id = id,
        this.title = title,
        this.completed = completed
        this.sector = sector
        this.assignedUser = assignedUser
        this.serviceOrder = serviceOrder
    };

}

export function parseToGetTaskDTO(task: Task): GetTaskDto{
    const serviceOrder = {
        id: task.serviceOrder.id,
        title: task.serviceOrder.title
      }

    const assignedUser = {
        id: task.assignedUser.id,
        name: task.assignedUser.name,
        email: task.assignedUser.email
    }

    return new GetTaskDto(task.id, task.title, task.sector, task.completed, serviceOrder, assignedUser)

}