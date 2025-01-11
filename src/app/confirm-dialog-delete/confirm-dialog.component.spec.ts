import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmDialogComponent1 } from './confirm-dialog.component';

describe('ConfirmDialogComponent', () => {
  let component: ConfirmDialogComponent1;
  let fixture: ComponentFixture<ConfirmDialogComponent1>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfirmDialogComponent1]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConfirmDialogComponent1);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
