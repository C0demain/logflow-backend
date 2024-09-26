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