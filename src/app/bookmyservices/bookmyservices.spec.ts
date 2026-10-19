import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Bookmyservices } from './bookmyservices';

describe('Bookmyservices', () => {
  let component: Bookmyservices;
  let fixture: ComponentFixture<Bookmyservices>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Bookmyservices],
    }).compileComponents();

    fixture = TestBed.createComponent(Bookmyservices);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
