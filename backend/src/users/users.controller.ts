import { Body, Controller, Post,Get ,Param,Patch,Delete,Res,Request} from '@nestjs/common';
import type { Response } from 'express';
import { ApiParam } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiTags } from '@nestjs/swagger';
import { ApiOperation, ApiResponse,ApiBearerAuth } from '@nestjs/swagger';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth/jwt-auth.guard';
import { ApiOkResponse } from '@nestjs/swagger';
import { UserResponseDto } from './dto/user-response.dto';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}


@ApiOperation({ summary: 'Create a new user' })
@ApiResponse({ status: 201, description: 'User created successfully' })
@ApiResponse({ status: 400, description: 'Validation error' })
@ApiResponse({ status: 409, description: 'Email already exists' })
@Post()
    createUser(@Body() createUserDto: CreateUserDto) {
  return this.usersService.createUser(createUserDto);
}

@UseGuards(JwtAuthGuard)
@ApiBearerAuth('access-token')
@ApiOperation({
  summary: 'Get all users',
  description: 'Returns all registered users.',
})
@ApiOkResponse({
  description: 'List of all users',
  type: UserResponseDto,
  isArray: true,
})
@ApiResponse({
  status: 401,
  description: 'Unauthorized',
})
@Get()
findAll() {
  return this.usersService.findAllUsers();
}

@UseGuards(JwtAuthGuard)
@ApiBearerAuth('access-token')
@ApiOperation({
  summary: 'Get user by ID',
})
@ApiParam({
  name: 'id',
  description: 'User ID',
  example: '6a8f4594dbbd39dce22a8b27',
})
@ApiOkResponse({
  description: 'User found',
  type: UserResponseDto,
})
@ApiResponse({
  status: 400,
  description: 'Invalid user ID',
})
@ApiResponse({
  status: 401,
  description: 'Unauthorized',
})
@ApiResponse({
  status: 404,
  description: 'User not found',
})
@Get(':id')
findOne(@Param('id') id: string) {
  return this.usersService.findUserById(id);
}

@UseGuards(JwtAuthGuard)
@ApiBearerAuth('access-token')
@ApiOperation({ summary: 'Update a user' })
@ApiResponse({ status: 200, description: 'User updated successfully' })
@ApiResponse({ status: 400, description: 'Invalid user ID or validation error' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
@ApiResponse({ status: 403, description: 'You can only update your own data' })
@ApiResponse({ status: 404, description: 'User not found' })
@ApiResponse({ status: 409, description: 'Email already exists' })
@Patch(':id')
updateUser(
  @Param('id') id: string,
  @Body() updateUserDto: UpdateUserDto,
  @Request() req,
) {
  return this.usersService.updateUser(
    id,
    updateUserDto,
    req.user.userId,
  );
}

@UseGuards(JwtAuthGuard)
@ApiBearerAuth('access-token')
@ApiOperation({
  summary: 'Delete own account',
})
@ApiParam({
  name: 'id',
  description: 'User ID',
  example: '6a8f4594dbbd39dce22a8b27',
})
@ApiResponse({
  status: 200,
  description: 'User deleted successfully',
})
@ApiResponse({
  status: 400,
  description: 'Invalid user ID',
})
@ApiResponse({
  status: 401,
  description: 'Unauthorized',
})
@ApiResponse({
  status: 403,
  description: 'You can only delete your own data',
})
@ApiResponse({
  status: 404,
  description: 'User not found',
})
@Delete(':id')
async removeUser(
  @Param('id') id: string,
  @Request() req,
  @Res({ passthrough: true }) response: Response,
) {
  const result = await this.usersService.deleteUser(
    id,
    req.user.userId,
  );

  // Clear authentication cookies after
  // successfully deleting the logged-in user's account.
  response.clearCookie('access_token', {
    httpOnly: true,
    sameSite: 'lax',
  });

  response.clearCookie('refresh_token', {
    httpOnly: true,
    sameSite: 'lax',
  });

  return result;
}
}