import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TablesActive } from './tables-active';

describe('TablesActive', () => {
  let component: TablesActive;
  let fixture: ComponentFixture<TablesActive>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TablesActive]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TablesActive);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
