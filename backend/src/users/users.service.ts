import { Injectable, NotFoundException,BadRequestException,ConflictException,ForbiddenException} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { InjectModel } from '@nestjs/mongoose';
import { Model,Types} from 'mongoose';

import { User, UserDocument } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
  ) {}

  async createUser(createUserDto: CreateUserDto) {
    const hashedPassword = await bcrypt.hash(
      createUserDto.password,
      10,
    );

    const user = new this.userModel({
      name: createUserDto.name,
      email: createUserDto.email,
      password: hashedPassword,
    });

    try {
    const savedUser = await user.save();

    const { password, ...userWithoutPassword } =
      savedUser.toObject();

    return userWithoutPassword;
  } catch (error) {
    if (error?.code === 11000) {
      throw new ConflictException('Email already exists');
    }

    throw error;
  }
  }
  async findAllUsers() {
  return this.userModel.find().exec();
}

async findUserById(id: string) {
  if (!Types.ObjectId.isValid(id)) {
    throw new BadRequestException('Invalid user ID');
  }

  const user = await this.userModel.findById(id).exec();

  if (!user) {
    throw new NotFoundException('User not found');
  }

  return user;
}

async updateUser(id: string, updateUserDto: UpdateUserDto,currentUserId: string,) 
{
  if (id !== currentUserId) {
    throw new ForbiddenException(
      'You can only update your own data',
    );
  }

{
  if (!Types.ObjectId.isValid(id)) {
    throw new BadRequestException('Invalid user ID');
  }

  const user = await this.userModel.findById(id).select('+password').exec();

  if (!user) {
    throw new NotFoundException('User not found');
  }

  if (updateUserDto.name !== undefined) {
    user.name = updateUserDto.name;
  }

  if (updateUserDto.email !== undefined) {
    user.email = updateUserDto.email;
  }

  if (updateUserDto.password !== undefined) {
    user.password = await bcrypt.hash(updateUserDto.password, 10);
  }

  try {
    const updatedUser = await user.save();

    const { password, ...userWithoutPassword } =
      updatedUser.toObject();

    return userWithoutPassword;
  } catch (error) {
    if (error?.code === 11000) {
      throw new ConflictException('Email already exists');
    }

    throw error;
  }
}}

async deleteUser(id: string,currentUserId: string,) {
  if (id !== currentUserId) {
    throw new ForbiddenException(
      'You can only delete your own data',
    );
  }

  if (!Types.ObjectId.isValid(id)) {
    throw new BadRequestException('Invalid user ID');
  }

  const user = await this.userModel.findByIdAndDelete(id).exec();

  if (!user) {
    throw new NotFoundException('User not found');
  }

  return {
    message: 'User deleted successfully',
  };
}

async findUserForLogin(email: string) {
  return this.userModel
    .findOne({ email })
    .select('+password')
    .exec();
}
}