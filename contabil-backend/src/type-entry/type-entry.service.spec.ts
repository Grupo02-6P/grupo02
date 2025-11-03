import { Test, TestingModule } from '@nestjs/testing';
import { TypeEntryService } from './type-entry.service';

describe('TypeEntryService', () => {
  let service: TypeEntryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TypeEntryService],
    }).compile();

    service = module.get<TypeEntryService>(TypeEntryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
