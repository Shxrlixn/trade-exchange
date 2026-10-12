import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { User } from './entity/user.entity';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  // =========================
  // CREATE USER
  // =========================

  async create(createUserDto: CreateUserDto) {
    // =========================
    // CHECK EMAIL
    // =========================

    const existingEmail =
      await this.userRepository.findOne({
        where: {
          email: createUserDto.email,
        },
      });

    if (existingEmail) {
      throw new ConflictException(
        'Email already exists',
      );
    }

    // =========================
    // CHECK PHONE
    // =========================

    const existingPhone =
      await this.userRepository.findOne({
        where: {
          phone: createUserDto.phone,
        },
      });

    if (existingPhone) {
      throw new ConflictException(
        'Phone number already exists',
      );
    }

    // =========================
    // HASH PASSWORD
    // =========================

    const passwordHash =
      await bcrypt.hash(
        createUserDto.password,
        10,
      );

    // =========================
    // CREATE USER
    // =========================

    const user =
      this.userRepository.create({
        name: createUserDto.name,
        email: createUserDto.email,
        password: passwordHash,
        phone: createUserDto.phone,
        address: createUserDto.address,
        dateOfBirth: new Date(
          createUserDto.dateOfBirth,
        ),
        gender: createUserDto.gender,
      });

    // =========================
    // SAVE USER
    // =========================

    return await this.userRepository.save(user);
  }

  // =========================
  // FIND ALL USERS
  // =========================

  async findAll() {
    return await this.userRepository.find();
  }

  // =========================
  // DELETE USER
  // =========================

  async delete(id: number) {
    const user =
      await this.userRepository.findOne({
        where: { id },
      });

    if (!user) {
      throw new NotFoundException(
        'User not found',
      );
    }

    await this.userRepository.remove(user);

    return {
      message: 'User deleted successfully',
    };
  }
}