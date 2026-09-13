import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RegisterAsEmployee } from './register-as-employee';

describe('RegisterAsEmployee', () => {
  let component: RegisterAsEmployee;
  let fixture: ComponentFixture<RegisterAsEmployee>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegisterAsEmployee],
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterAsEmployee);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
