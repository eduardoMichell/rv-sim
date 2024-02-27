import { TestBed } from '@angular/core/testing';

import { RiscvService } from './riscv.service';

describe('RiscvService', () => {
  let service: RiscvService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RiscvService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
