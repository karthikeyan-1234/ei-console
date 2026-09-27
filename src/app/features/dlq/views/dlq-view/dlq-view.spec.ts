import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DlqView } from './dlq-view';

describe('DlqView', () => {
  let component: DlqView;
  let fixture: ComponentFixture<DlqView>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DlqView],
    }).compileComponents();

    fixture = TestBed.createComponent(DlqView);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
