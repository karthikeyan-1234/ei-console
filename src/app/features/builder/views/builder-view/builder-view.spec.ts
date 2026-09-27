import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BuilderView } from './builder-view';

describe('BuilderView', () => {
  let component: BuilderView;
  let fixture: ComponentFixture<BuilderView>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BuilderView],
    }).compileComponents();

    fixture = TestBed.createComponent(BuilderView);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
