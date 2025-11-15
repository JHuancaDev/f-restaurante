import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TableDetail } from './table-detail';

describe('TableDetail', () => {
  let component: TableDetail;
  let fixture: ComponentFixture<TableDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TableDetail]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TableDetail);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
