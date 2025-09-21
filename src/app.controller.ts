import { Controller, Get, Logger } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@Controller('health')
@ApiTags('health')
export class HealthController {
  private readonly logger = new Logger(HealthController.name);
  @Get()
  @ApiOperation({summary: 'Check health status'})
  check() {
    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');
    const formatted = `${pad(now.getDate())}-${pad(now.getMonth() + 1)}-${pad(now.getFullYear() % 100)} ${pad(now.getHours())}-${pad(now.getMinutes())}`;
    this.logger.log(`Check health Status - ${formatted} - Ok`);

    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }
}

