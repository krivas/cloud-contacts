import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrashDirectoryComponent } from './trash-directory.component';

describe('TrashDirectoryComponent', () => {
  let component: TrashDirectoryComponent;
  let fixture: ComponentFixture<TrashDirectoryComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TrashDirectoryComponent]
    });
    fixture = TestBed.createComponent(TrashDirectoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
