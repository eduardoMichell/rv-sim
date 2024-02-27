import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DumpFileDialogComponent } from './dump-file-dialog.component';

describe('DumpFileDialogComponent', () => {
  let component: DumpFileDialogComponent;
  let fixture: ComponentFixture<DumpFileDialogComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DumpFileDialogComponent]
    });
    fixture = TestBed.createComponent(DumpFileDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
