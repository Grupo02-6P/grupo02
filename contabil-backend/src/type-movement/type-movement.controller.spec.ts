import { Test, TestingModule } from '@nestjs/testing';
import { TypeMovementController } from './type-movement.controller';
import { TypeMovementService } from './type-movement.service';

describe('TypeMovementController', () => {
  let controller: TypeMovementController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TypeMovementController],
      providers: [TypeMovementService],
    }).compile();

    controller = module.get<TypeMovementController>(TypeMovementController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
