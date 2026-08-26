import { Body, Controller, Post,Get ,Param} from '@nestjs/common';

import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
    createUser(@Body() createUserDto: CreateUserDto) {
  return this.usersService.createUser(createUserDto);
}

@Get()
findAllUsers() {
  return this.usersService.findAllUsers();
}

@Get(':id')
findUserById(@Param('id') id: string) {
  return this.usersService.findUserById(id);
}
}