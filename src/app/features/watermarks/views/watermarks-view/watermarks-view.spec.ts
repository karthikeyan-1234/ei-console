import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WatermarksView } from './watermarks-view';

describe('WatermarksView', () => {
  let component: WatermarksView;
  let fixture: ComponentFixture<WatermarksView>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WatermarksView],
    }).compileComponents();

    fixture = TestBed.createComponent(WatermarksView);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
