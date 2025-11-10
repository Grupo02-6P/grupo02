import { Test, TestingModule } from '@nestjs/testing';
import { TittleService } from './tittle.service';

describe('TittleService', () => {
  let service: TittleService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TittleService],
    }).compile();

    service = module.get<TittleService>(TittleService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
