import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConnectionsView } from './connections-view';

describe('ConnectionsView', () => {
  let component: ConnectionsView;
  let fixture: ComponentFixture<ConnectionsView>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConnectionsView],
    }).compileComponents();

    fixture = TestBed.createComponent(ConnectionsView);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
