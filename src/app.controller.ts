import { Controller, Get, Logger } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Controller('health')
@ApiTags('health')
export class HealthController {
  private readonly logger = new Logger(HealthController.name);
  constructor(
    @InjectQueue('notifications') private readonly notificationsQueue: Queue,
  ) {}
  @Get()
  @ApiOperation({ summary: 'Check health status' })
  async check() {
    const now = new Date();
    const status = { app: 'ok' };
    try {
      await this.notificationsQueue.getJobCounts();
      status['redis'] = 'ok';
    } catch (err) {
      status['redis'] = 'error';
    }
    this.logger.log(`Health check: ${JSON.stringify(status)}`);
    return {
      status,
      timestamp: now.toISOString(),
    };
  }
}

