import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TicketAssignment } from '../entities/ticket-assignment.entity';

@Injectable()
export class TicketAssignmentService {
  constructor(
    @InjectRepository(TicketAssignment)
    private readonly assignmentRepo: Repository<TicketAssignment>,
  ) {}

  async findByAdmin(adminId: string) {
    return this.assignmentRepo.find({
      where: { assignedTo: adminId },
      relations: { ticket: true },
      order: { createdAt: 'DESC' },
    });
  }

  async history(ticketId: string) {
    return this.assignmentRepo.find({
      where: { ticketId },
      relations: { assignedAdmin: true },
      order: { createdAt: 'DESC' },
    });
  }
}
