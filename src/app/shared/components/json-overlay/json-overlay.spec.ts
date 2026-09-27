import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JsonOverlay } from './json-overlay';

describe('JsonOverlay', () => {
  let component: JsonOverlay;
  let fixture: ComponentFixture<JsonOverlay>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JsonOverlay],
    }).compileComponents();

    fixture = TestBed.createComponent(JsonOverlay);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
