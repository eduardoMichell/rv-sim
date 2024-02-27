import { TestBed } from '@angular/core/testing';

import { ButtonsService } from './buttons.service';

describe('ButtonsServiceService', () => {
  let service: ButtonsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ButtonsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
