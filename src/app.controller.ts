import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@Controller('health')
@ApiTags('health')
export class HealthController {
  @Get()
  @ApiOperation({summary: 'Check health status'})
  check() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }
}

