import {
  Controller,
  Post,
  Get,
  Param,
  Delete,
  Res,
  UploadedFile,
  UseInterceptors,
  Body,
  UseGuards,
  Query,
} from '@nestjs/common';
import { FileService } from './file.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { AuthenticationGuard } from '../auth/authentication.guard';

@ApiTags('files')
@ApiBearerAuth()
@Controller('api/v1/files')
@UseGuards(AuthenticationGuard)
export class FileController {
  constructor(private readonly fileService: FileService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File,@Body() body: { userId?: string, taskId?: string })  {
    const savedFile = await this.fileService.uploadFile(file, body.userId, body.taskId);
    return { id: savedFile.id, filename: savedFile.filename };
  }

  @Get()
  @ApiQuery({ name: 'userId', required: false, type: String })
  @ApiQuery({ name: 'taskId', required: false, type: String })
  async getAll(
    @Query('userId') userId?: string,
    @Query('taskId') taskId?: string,
  ) {
    try {
      const files = await this.fileService.findAll({
        userId,
        taskId,
      });

      if (!files || files.length === 0) {
        return {
          message: 'Nenhum arquivo encontrado.',
          files: [],
        };
      }

      return {
        message: 'Arquivos encontrados.',
        files: files,
      };
    } catch (error) {
      return {
        message: 'Erro ao buscar arquivos.',
        files: [],
      };
    }
  }

  @Get(':id')
  async getFile(@Param('id') id: string, @Res() res: Response) {
    const file = await this.fileService.getFileByName(id);
    res.setHeader('Content-Type', file.mimetype);
    res.send(file.data);
  }

  @Delete(':id')
  async deleteFile(@Param('id') id: string) {
    const arquivo = await this.fileService.deleteFile(id);
    return {
       message:`Arquivo ${arquivo?.filename} deletado.`};
  }
}
