import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TenantsView } from './tenants-view';

describe('TenantsView', () => {
  let component: TenantsView;
  let fixture: ComponentFixture<TenantsView>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TenantsView],
    }).compileComponents();

    fixture = TestBed.createComponent(TenantsView);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
