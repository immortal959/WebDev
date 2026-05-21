import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StreetForm } from './street-form';

describe('StreetForm', () => {
  let component: StreetForm;
  let fixture: ComponentFixture<StreetForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StreetForm],
    }).compileComponents();

    fixture = TestBed.createComponent(StreetForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
