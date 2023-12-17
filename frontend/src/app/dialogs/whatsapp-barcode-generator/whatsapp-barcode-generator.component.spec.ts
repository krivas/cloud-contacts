import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WhatsappBarcodeGeneratorComponent } from './whatsapp-barcode-generator.component';

describe('WhatsappBarcodeGeneratorComponent', () => {
  let component: WhatsappBarcodeGeneratorComponent;
  let fixture: ComponentFixture<WhatsappBarcodeGeneratorComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [WhatsappBarcodeGeneratorComponent]
    });
    fixture = TestBed.createComponent(WhatsappBarcodeGeneratorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
