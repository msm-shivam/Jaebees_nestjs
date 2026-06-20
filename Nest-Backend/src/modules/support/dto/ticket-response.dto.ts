import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Exclude, Expose, Type } from 'class-transformer';
import { TicketStatus } from '../enums/ticket-status.enum';
import { TicketCategory } from '../enums/ticket-category.enum';
import { TicketPriority } from '../enums/ticket-priority.enum';

@Exclude()
class CustomerInfo {
  @Expose() @ApiProperty() id: string;
  @Expose() @ApiProperty() firstName: string;
  @Expose() @ApiProperty() lastName: string;
  @Expose() @ApiProperty() email: string;
}

@Exclude()
class AssignedAdminInfo {
  @Expose() @ApiProperty() id: string;
  @Expose() @ApiProperty() name: string;
  @Expose() @ApiProperty() email: string;
}

@Exclude()
class MessageInfo {
  @Expose() @ApiProperty() id: string;
  @Expose() @ApiProperty() senderId: string;
  @Expose() @ApiProperty() senderType: string;
  @Expose() @ApiProperty() message: string;
  @Expose() @ApiProperty() createdAt: Date;
}

@Exclude()
export class TicketResponseDto {
  @Expose() @ApiProperty() id: string;
  @Expose() @ApiProperty() ticketNumber: string;
  @Expose() @ApiProperty() subject: string;
  @Expose() @ApiProperty({ enum: TicketCategory }) category: TicketCategory;
  @Expose() @ApiProperty({ enum: TicketPriority }) priority: TicketPriority;
  @Expose() @ApiProperty({ enum: TicketStatus }) status: TicketStatus;
  @Expose() @ApiPropertyOptional() orderId: string | null;
  @Expose() @ApiPropertyOptional() firstResponseAt: Date | null;
  @Expose() @ApiPropertyOptional() resolvedAt: Date | null;

  @Expose()
  @ApiProperty({ type: CustomerInfo })
  @Type(() => CustomerInfo)
  customer: CustomerInfo;

  @Expose()
  @ApiPropertyOptional({ type: AssignedAdminInfo })
  @Type(() => AssignedAdminInfo)
  assignedAdmin: AssignedAdminInfo | null;

  @Expose()
  @ApiProperty({ type: [MessageInfo] })
  @Type(() => MessageInfo)
  messages: MessageInfo[];

  @Expose() @ApiProperty() createdAt: Date;
  @Expose() @ApiProperty() updatedAt: Date;
}
