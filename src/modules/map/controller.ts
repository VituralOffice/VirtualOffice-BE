import { Body, Controller, Get, Param, Patch, Post, Put, Query } from '@nestjs/common';
import { CreateMapDto, QueryMapDto, UpdateMapDto } from './dto';
import { MapService } from './service';
import { ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/common/decorators/role.decorator';
import { ROLE } from 'src/common/enum/role';
import { ApiException } from 'src/common';
import { Public } from 'src/common/decorators/public.decorator';
@ApiTags('maps')
@Controller({
  path: 'maps',
})
export class MapController {
  constructor(private readonly mapService: MapService) {}
  @Post()
  @Roles([ROLE.ADMIN])
  async create(@Body() body: CreateMapDto) {
    const existName = await this.mapService.findByName(body.name);
    if (existName) throw new ApiException(`map name exist`, 400);
    const map = await this.mapService.create(body);
    return {
      result: map,
      message: `Success`,
    };
  }
  @Get()
  @Public()
  async findAll(@Query() query: QueryMapDto) {
    //todo: paginate later
    const maps = query.groupBy ? await this.mapService.findAllAndGroup(query) : await this.mapService.findAll();
    return {
      result: maps,
      message: `Success`,
    };
  }
  @Get(`:id`)
  @Public()
  async findOne(@Param(`id`) id: string) {
    const map = await this.mapService.findById(id);
    if (!map) throw new ApiException(`map not found`, 404);
    return {
      result: map,
      message: `Success`,
    };
  }
  @Put(`:id`)
  @Roles([ROLE.ADMIN])
  async update(@Param(`id`) id: string, @Body() data: UpdateMapDto) {
    const map = await this.mapService.findById(id);
    if (!map) throw new ApiException(`map not found`, 404);
    if (data.json) map.json = data.json;
    if (data.totalChair) map.totalChair = data.totalChair;
    if (data.totalMeeting) map.totalMeeting = data.totalMeeting;
    if (data.totalWhiteboard) map.totalWhiteboard = data.totalWhiteboard;
    if (data.default !== undefined) map.default = data.default;
    if (data.style) map.style = data.style;
    if (data.name) map.name = data.name;
    if (data.capacity) map.capacity = data.capacity;
    if (data.icon) map.icon = data.icon;
    await map.save();
    return {
      result: map,
      message: `Success`,
    };
  }
}
