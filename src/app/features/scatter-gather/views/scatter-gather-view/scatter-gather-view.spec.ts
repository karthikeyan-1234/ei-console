import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScatterGatherView } from './scatter-gather-view';

describe('ScatterGatherView', () => {
  let component: ScatterGatherView;
  let fixture: ComponentFixture<ScatterGatherView>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScatterGatherView],
    }).compileComponents();

    fixture = TestBed.createComponent(ScatterGatherView);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
