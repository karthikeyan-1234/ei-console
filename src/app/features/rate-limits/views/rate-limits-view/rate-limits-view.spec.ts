import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RateLimitsView } from './rate-limits-view';

describe('RateLimitsView', () => {
  let component: RateLimitsView;
  let fixture: ComponentFixture<RateLimitsView>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RateLimitsView],
    }).compileComponents();

    fixture = TestBed.createComponent(RateLimitsView);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
