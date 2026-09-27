import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsoleSidebar } from './console-sidebar';

describe('ConsoleSidebar', () => {
  let component: ConsoleSidebar;
  let fixture: ComponentFixture<ConsoleSidebar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConsoleSidebar],
    }).compileComponents();

    fixture = TestBed.createComponent(ConsoleSidebar);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
