import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StatusDot } from './status-dot';

describe('StatusDot', () => {
  let component: StatusDot;
  let fixture: ComponentFixture<StatusDot>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StatusDot],
    }).compileComponents();

    fixture = TestBed.createComponent(StatusDot);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
