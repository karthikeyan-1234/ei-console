import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsoleFrame } from './console-frame';

describe('ConsoleFrame', () => {
  let component: ConsoleFrame;
  let fixture: ComponentFixture<ConsoleFrame>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConsoleFrame],
    }).compileComponents();

    fixture = TestBed.createComponent(ConsoleFrame);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
