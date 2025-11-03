import { Test, TestingModule } from '@nestjs/testing';
import { TypeMovementService } from './type-movement.service';

describe('TypeMovementService', () => {
  let service: TypeMovementService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TypeMovementService],
    }).compile();

    service = module.get<TypeMovementService>(TypeMovementService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
