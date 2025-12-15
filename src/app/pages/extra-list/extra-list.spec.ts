import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExtraList } from './extra-list';

describe('ExtraList', () => {
  let component: ExtraList;
  let fixture: ComponentFixture<ExtraList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExtraList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExtraList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
