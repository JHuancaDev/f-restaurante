import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderDetailExtras } from './order-detail-extras';

describe('OrderDetailExtras', () => {
  let component: OrderDetailExtras;
  let fixture: ComponentFixture<OrderDetailExtras>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrderDetailExtras]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrderDetailExtras);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
