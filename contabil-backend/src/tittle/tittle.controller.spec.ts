import { Test, TestingModule } from '@nestjs/testing';
import { TittleController } from './tittle.controller';
import { TittleService } from './tittle.service';

describe('TittleController', () => {
  let controller: TittleController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TittleController],
      providers: [TittleService],
    }).compile();

    controller = module.get<TittleController>(TittleController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
