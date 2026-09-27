import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExecutionsView } from './executions-view';

describe('ExecutionsView', () => {
  let component: ExecutionsView;
  let fixture: ComponentFixture<ExecutionsView>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExecutionsView],
    }).compileComponents();

    fixture = TestBed.createComponent(ExecutionsView);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
