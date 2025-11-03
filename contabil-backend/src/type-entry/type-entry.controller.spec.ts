import { Test, TestingModule } from '@nestjs/testing';
import { TypeEntryController } from './type-entry.controller';
import { TypeEntryService } from './type-entry.service';

describe('TypeEntryController', () => {
  let controller: TypeEntryController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TypeEntryController],
      providers: [TypeEntryService],
    }).compile();

    controller = module.get<TypeEntryController>(TypeEntryController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
