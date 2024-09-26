import { Task } from "src/modules/task/entities/task.entity"

export class GetTaskDto{
    readonly id: string
    readonly title: string
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

    return new GetTaskDto(task.id, task.title, task.completed, serviceOrder, assignedUser)

}