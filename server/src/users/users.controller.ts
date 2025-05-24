import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  Put,
  Req,
  Patch,
  Query,
} from '@nestjs/common';
import { UserService } from './users.service';
import { User } from './entities/user';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Group } from 'src/groups/entities/group.entity';
import { ReqUser } from 'src/common/types/req-user';

@Controller('users')
@ApiBearerAuth()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  async findAll(): Promise<User[]> {
    return this.userService.findAll();
  }

  @Get('/me/groups')
  async findGroups(@Req() { user }: { user: ReqUser }): Promise<Group[]> {
    return this.userService.findGroups(user.sub);
  }

  @Get('/search')
  async search(@Query('q') query: string): Promise<User[]> {
    return this.userService.search(query);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<User | null> {
    return this.userService.findOne(id);
  }

  @Patch('/me')
  async updateMe(
    @Req() { user }: { user: ReqUser },
    @Body() updateUserDto: { pseudo: string },
  ): Promise<User | null> {
    return this.userService.update(user.sub, updateUserDto);
  }
}
