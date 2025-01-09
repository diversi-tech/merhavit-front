import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TopIconsComponent } from './top-icons.component';

describe('TopIconsComponent', () => {
  let component: TopIconsComponent;
  let fixture: ComponentFixture<TopIconsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TopIconsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TopIconsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
