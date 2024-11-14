import {
    EntitySubscriberInterface,
    EventSubscriber,
    UpdateEvent
} from 'typeorm';
import { Task } from '../task/entities/task.entity';
import { Status } from './enums/status.enum';

@EventSubscriber()
export class ServiceOrderSubscriber implements EntitySubscriberInterface<Task> {
  listenTo() {
    return Task;
  }

  beforeUpdate(event: UpdateEvent<Task>): Promise<any> | void {
    console.log('Atualizando Task através do subscriber', event.databaseEntity.title);
  }
}
