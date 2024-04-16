import { Controller, Get, Post, Body, Param, Inject, Query, ParseUUIDPipe, Patch } from '@nestjs/common';

import { CreateOrderDto, OrderPaginationDto, StatusDto } from './dto/index';
import { NATS_SERVICE } from 'src/config';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { PaginationDto } from '../common/dto/pagination.dtos';

@Controller('orders')
export class OrdersController {

  constructor(
    @Inject(NATS_SERVICE)
    private readonly client: ClientProxy
  ) { }

  @Post()
  create(@Body() createOrderDto: CreateOrderDto) {
    return this.client.send(
      'createOrder',
      createOrderDto
    );
  }

  @Get()
  findAll(
    @Query() orderPaginationDto: OrderPaginationDto
  ) {
    return this.client.send(
      'findAllOrders',
      orderPaginationDto
    );
  }

  @Get('id/:id')
  async findOne(
    @Param('id', ParseUUIDPipe) id: string) {
    try {
      const order = await firstValueFrom(
        this.client.send(
          'findOneOrder',
          { id }
        ))

      return order
    } catch (error) {
      throw new RpcException(error)
    };
  }

  @Get(':status')
  async findOneByStatus(
    @Param() statusDto: StatusDto,
    @Query() paginationDto: PaginationDto
  ) {
    try {
      return this.client.send(
        'findAllOrders',
        {
          ...paginationDto,
          status: statusDto.status
        }
      );
    } catch (error) {
      throw new RpcException(error)
    };
  }

  @Patch(':id')
  async updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() statusDto: StatusDto
  ) {
    try {
      return this.client.send(
        'changeOrderStatus',
        {
          id,
          status: statusDto.status
        }

      )

    } catch (error) {
      throw new RpcException(error)
    }
  }

}
