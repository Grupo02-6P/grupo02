import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, BadRequestException, NotFoundException, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { FilterUserDto } from './dto/filter-user.dto';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { Role } from '@prisma/client';

@UseGuards(AuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
  
  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  findAll(@Query() filterDto: FilterUserDto) {
    return this.usersService.findAll(filterDto);
  }

  @Get('role')
  findAllByRole(@Query('role') role: string) {
    return this.usersService.findAllByRole(role);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const user =  await this.usersService.findOne(id);
    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }
    return user;
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }

  @Patch(':id/inactivate')
  inactive(@Param('id') id: string) {
    return this.usersService.inactivate(id);
  }
}
