import { ApiProperty } from "@nestjs/swagger";
import { Plan } from "./schema";
import { IsInt, IsNotEmpty, IsString, isInt } from "class-validator";

export class PlanEntity extends Plan {
  @ApiProperty()
  id?: string
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  name: string;
  @ApiProperty()
  @IsNotEmpty()
  @IsInt()
  maxRoom: number;
  @ApiProperty()
  @IsNotEmpty()
  @IsInt()
  maxRoomCapacity: number;
  @ApiProperty()
  @IsNotEmpty()
  price: number
  @ApiProperty()
  features: string[]
}