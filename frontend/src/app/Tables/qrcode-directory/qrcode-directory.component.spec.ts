import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QrcodeDirectoryComponent } from './qrcode-directory.component';

describe('QrcodeDirectoryComponent', () => {
  let component: QrcodeDirectoryComponent;
  let fixture: ComponentFixture<QrcodeDirectoryComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [QrcodeDirectoryComponent]
    });
    fixture = TestBed.createComponent(QrcodeDirectoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
