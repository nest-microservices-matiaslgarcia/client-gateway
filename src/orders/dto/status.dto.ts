import { IsEnum, IsOptional } from "class-validator";
import { OrderStatus, OrderStatusList } from "../enum/order.enum";



export class StatusDto{

    @IsEnum(OrderStatusList, {
        message: `Valid status are: ${OrderStatusList}`
    })
    @IsOptional()
    status: OrderStatus;
}