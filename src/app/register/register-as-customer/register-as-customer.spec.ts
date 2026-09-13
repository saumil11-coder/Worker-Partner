import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RegisterAsCustomer } from './register-as-customer';

describe('RegisterAsCustomer', () => {
  let component: RegisterAsCustomer;
  let fixture: ComponentFixture<RegisterAsCustomer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegisterAsCustomer],
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterAsCustomer);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
