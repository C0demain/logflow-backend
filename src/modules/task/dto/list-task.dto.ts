import { UserEntity } from "src/modules/user/user.entity";

export class GetTaskDto{
    readonly id: string
    readonly title: string
    readonly assignedUser: {
        id: string,
        name: string,
        email: string
    }

    constructor(
        id: string,
        title: string,
        assignedUser: {
            id: string,
            name: string,
            email: string
        }
    ){
        this.id = id,
        this.title = title,
        this.assignedUser = assignedUser
    };

}