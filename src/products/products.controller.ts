import { Controller, Get, Post, Body, Patch, Param, Delete, Inject, Query, ParseIntPipe, BadRequestException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { NATS_SERVICE } from 'src/config';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { PaginationDto } from 'src/common';
import { catchError, firstValueFrom } from 'rxjs';

@Controller('products')
export class ProductsController {


  constructor(
    @Inject(NATS_SERVICE)
    private readonly client: ClientProxy
  ) { }

  @Post()
  createProduct(
    @Body() createProductDto: CreateProductDto
  ) {
    return this.client.send(
      { cmd: 'create_product' },
      createProductDto
    );
  }

  @Get()
  findAllProducts(
    @Query() paginationDto: PaginationDto
  ) {
    return this.client.send(
      { cmd: 'find_all_product' },
      paginationDto
    );
  }


  @Get(':id')
  async findOneProduct(
    @Param('id', ParseIntPipe) id: number
  ) {
    try {
      const product = await firstValueFrom(
        this.client.send(
          { cmd: 'find_product_by_id' },
          { id }
        ))

      return product
    } catch (error) {
      throw new RpcException(error)
    }
  }

  @Patch(':id')
  updateProduct(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProductDto: UpdateProductDto) {
    return this.client.send(
      { cmd: 'update_product_by_id' },
      { id, ...updateProductDto }
    )
      .pipe(
        catchError(e => { throw new RpcException(e) })
      );
  }

  @Delete(':id')
  removeProduct(
    @Param('id', ParseIntPipe) id: number) {
    return this.client.send(
      { cmd: 'delete_product_by_id' },
      { id }
    )
      .pipe(
        catchError(e => { throw new RpcException(e) })
      );
  }
}