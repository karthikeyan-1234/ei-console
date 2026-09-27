import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExecutionDetailView } from './execution-detail-view';

describe('ExecutionDetailView', () => {
  let component: ExecutionDetailView;
  let fixture: ComponentFixture<ExecutionDetailView>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExecutionDetailView],
    }).compileComponents();

    fixture = TestBed.createComponent(ExecutionDetailView);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
