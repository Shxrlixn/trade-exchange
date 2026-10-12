import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';

import {
  JwtAuthGuard,
} from '../auth/jwt-auth.guard';

import {
  OrderService,
} from './order.service';

import {
  CreateOrderDto,
} from './dto/create-order.dto';


@Controller('order')
@UseGuards(JwtAuthGuard)
export class OrderController {

  constructor(
    private readonly orderService:
      OrderService,
  ) {}

  // =========================
  // CREATE ORDER
  // =========================

  @Post()
  createOrder(
    @Request() request: any,

    @Body()
    createOrderDto:
      CreateOrderDto,
  ) {

    return this.orderService.createOrder(
      createOrderDto,
      request.user.userId,
    );

  }


  // =========================
  // GET CURRENT ORDERS
  // =========================

  @Get()
  findCurrentOrders(
    @Request() request: any,
  ) {

    return this.orderService.findCurrentOrders(
      request.user.userId,
    );

  }


  // =========================
  // GET ORDER BY ID
  // =========================

  @Get(':id')
  findOrderById(
    @Request() request: any,

    @Param(
      'id',
      ParseIntPipe,
    )
    id: number,
  ) {

    return this.orderService.findOrderById(
      id,
      request.user.userId,
    );

  }


  // =========================
  // CANCEL ORDER
  // =========================

  @Patch(':id/cancel')
  cancelOrder(
    @Request() request: any,

    @Param(
      'id',
      ParseIntPipe,
    )
    id: number,
  ) {

    return this.orderService.cancelOrder(
      id,
      request.user.userId,
    );

  }

}