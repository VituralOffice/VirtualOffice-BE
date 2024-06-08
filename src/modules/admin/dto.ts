import { Transform } from 'class-transformer';
import { IsNumber, IsOptional } from 'class-validator';
import moment from 'moment';

export class QueryDto {
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @IsOptional()
  page: number = 1;
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @IsOptional()
  limit: number = 20;
  q?: string;
}
export class QueryUserStatsDto {
  @Transform(({ value }) => (value ? moment(value, `YYYY-MM-DD`).toDate() : new Date()))
  @IsOptional()
  startDate: Date;
}
