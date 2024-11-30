import {
  DataSource,
  EntitySubscriberInterface,
  EventSubscriber,
  Repository,
  UpdateEvent,
} from 'typeorm';
import { Task } from '../task/entities/task.entity';
import { ServiceOrderLog } from './entities/service-order-log.entity';
import { ServiceOrder } from './entities/service-order.entity';
import { ServiceOrderService } from './service-order.service';
import e from 'express';
import { Status } from './enums/status.enum';

@EventSubscriber()
export class ServiceOrderSubscriber implements EntitySubscriberInterface<Task> {
  constructor() {}

  listenTo() {
    return Task;
  }

  async afterUpdate(event: UpdateEvent<Task>) {
    try {
      const updatedTask = event.entity as Task;
      const oldTask = event.databaseEntity as Task;
      if (
        updatedTask.completedAt &&
        !oldTask.completedAt &&
        updatedTask &&
        updatedTask.serviceOrder &&
        updatedTask.sector
      ) {
        const serviceOrder = await event.manager.findOneOrFail(ServiceOrder, {
          where: { id: updatedTask.serviceOrder.id },
          relations: {
            serviceOrderLogs: true,
            tasks: true,
          },
        });
        const tasks = await event.manager.find(Task, {
          where: {
            serviceOrder: { id: updatedTask.serviceOrder.id },
            sector: updatedTask.sector,
          },
        });

        console.log(tasks.length);
        const isSectorFinished = tasks.every(
          (task) => task.completedAt !== null,
        );

        const isServiceOrderFinished = serviceOrder.tasks.every(
          (task) => task.completedAt !== null,
        );

        if (isSectorFinished) {
          const serviceOrderLog = new ServiceOrderLog();
          serviceOrderLog.changedTo = updatedTask.sector;
          serviceOrder.serviceOrderLogs.push(serviceOrderLog);
          await event.manager.save(ServiceOrder, serviceOrder);
          if (isServiceOrderFinished) {
            serviceOrder.status = Status.FINALIZADO;
            await event.manager.save(ServiceOrder, serviceOrder);
          }
        }
      }
    } catch (error) {
      throw new Error(error);
    }
  }
}
