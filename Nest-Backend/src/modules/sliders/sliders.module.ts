import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Slider } from './entities/slider.entity';
import { SlidersService } from './sliders.service';
import { AdminSliderController } from './controllers/admin-slider.controller';
import { PublicSliderController } from './controllers/public-slider.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Slider])],
  controllers: [AdminSliderController, PublicSliderController],
  providers: [SlidersService],
  exports: [SlidersService],
})
export class SlidersModule {}
