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
    const { entity, databaseEntity, updatedColumns } = event;

    if(!databaseEntity.serviceOrder) return;

    const currentServiceOrder = databaseEntity.serviceOrder
    const createdAt = new Date();

    if (!entity || !updatedColumns) return;
    const logEntries: ServiceOrderLog[] = []
    
    let message: string = `Tarefa ${databaseEntity.title} atualizada`;
    try {
      if(updatedColumns.some(col => col.propertyName === 'dueDate')){
        if(!databaseEntity.dueDate && entity.dueDate){
          message = `Prazo ${entity.dueDate} adicionado à tarefa ${databaseEntity.title}`
        }else if(databaseEntity.dueDate && !entity.dueDate){
          message = `Prazo removido da tarefa ${databaseEntity.title}`
        }else{
          message = `Prazo ${databaseEntity.dueDate} alterado para ${entity.dueDate} na tarefa ${databaseEntity.title}`
        }

        const log = new ServiceOrderLog()
        log.serviceOrder = currentServiceOrder
        log.creationDate = createdAt
        log.action = message
        logEntries.push(log)
      }

      if(updatedColumns.some(col => col.propertyName === 'completedAt')){
        if(!databaseEntity.completedAt && entity.completedAt){
          message = `Tarefa ${databaseEntity.title} concluída`
        }else if(databaseEntity.completedAt && !entity.completedAt){
          message = `Tarefa ${databaseEntity.title} marcada como não concluída`
        }

        const log = new ServiceOrderLog()
        log.serviceOrder = currentServiceOrder
        log.creationDate = createdAt
        log.action = message
        logEntries.push(log)
      }

      if(updatedColumns.some(col => col.propertyName === 'taskCost')){
        if(!databaseEntity.taskCost && entity.taskCost){
          message = `Custo ${entity.taskCost} adicionado à tarefa ${databaseEntity.title}`
        }else if(databaseEntity.taskCost && !entity.taskCost){
          message = `Custo removido da tarefa ${databaseEntity.title}`
        }else{
          message = `Custo ${databaseEntity.taskCost} alterado para ${entity.taskCost} na tarefa ${databaseEntity.title}`
        }

        const log = new ServiceOrderLog()
        log.serviceOrder = currentServiceOrder
        log.creationDate = createdAt
        log.action = message
        logEntries.push(log)
      }

      if (logEntries.length > 0) {
        await event.manager.save(ServiceOrderLog, logEntries);
      }
      
    } catch (error) {
      throw new Error(error);
    }
  }
}
