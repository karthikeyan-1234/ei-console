import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuthProfilesView } from './auth-profiles-view';

describe('AuthProfilesView', () => {
  let component: AuthProfilesView;
  let fixture: ComponentFixture<AuthProfilesView>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuthProfilesView],
    }).compileComponents();

    fixture = TestBed.createComponent(AuthProfilesView);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
