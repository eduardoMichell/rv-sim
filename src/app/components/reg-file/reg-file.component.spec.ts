import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegFileComponent } from './reg-file.component';

describe('RegFileComponent', () => {
  let component: RegFileComponent;
  let fixture: ComponentFixture<RegFileComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [RegFileComponent]
    });
    fixture = TestBed.createComponent(RegFileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
