import { Controller, Get, Logger } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { InjectQueue } from '@nestjs/bullmq';
import { InjectConnection } from '@nestjs/mongoose';
import { Queue } from 'bullmq';
import { Connection } from 'mongoose';

@Controller('health')
@ApiTags('health')
export class HealthController {
  private readonly logger = new Logger(HealthController.name);
  
  constructor(
    @InjectQueue('notifications') private readonly notificationsQueue: Queue,
    @InjectConnection() private readonly mongooseConnection: Connection,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Verificar estado de salud del sistema' })
  async check() {
    const now = new Date();
    const status = { app: 'ok' };
    
    // Verificar Redis
    try {
      await this.notificationsQueue.getJobCounts();
      status['redis'] = 'ok';
    } catch (err) {
      status['redis'] = 'error';
      this.logger.error(`Redis health check failed: ${err.message}`);
    }

    // Verificar MongoDB
    try {
      await this.mongooseConnection.db.admin().ping();
      status['mongodb'] = 'ok';
    } catch (err) {
      status['mongodb'] = 'error';
      this.logger.error(`MongoDB health check failed: ${err.message}`);
    }

    // Obtener estadísticas de la cola
    let queueStats = {};
    try {
      const counts = await this.notificationsQueue.getJobCounts();
      queueStats = {
        waiting: counts.waiting,
        active: counts.active,
        completed: counts.completed,
        failed: counts.failed,
      };
    } catch (err) {
      this.logger.error(`Failed to get queue stats: ${err.message}`);
    }

    const overallStatus = Object.values(status).every(s => s === 'ok') ? 'healthy' : 'unhealthy';
    
    this.logger.log(`Health check: ${JSON.stringify(status)} - Overall: ${overallStatus}`);
    
    return {
      status: overallStatus,
      services: status,
      queue: queueStats,
      timestamp: now.toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0',
    };
  }
}

