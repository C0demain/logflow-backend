import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateEventDTO {
  @ApiProperty({ name: 'userId', required: true })
  @IsUUID()
  userId: string;

  @ApiProperty({ name: 'title', required: true })
  @IsString()
  title: string;

  @ApiProperty({ name: 'description', required: true })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ name: 'start', required: true })
  @IsDateString()
  start: string;

  @ApiProperty({ name: 'end', required: true })
  @IsDateString()
  end: string;

  @ApiProperty({ name: 'location', required: false })
  @IsString()
  @IsOptional()
  location?: string;
}
