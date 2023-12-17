import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Message } from 'primeng/api';
import { Contact } from 'src/app/Dtos/Contact';
import { ContactService } from 'src/app/Services/contact.service';


interface WhatsAppGenerator {
  phoneNumberText?: string;
  phoneNumberDropDown?: string;
}
interface Mobile {
  phone: string;
  id:string
}

@Component({
  selector: 'app-whatsapp-barcode-generator',
  templateUrl: './whatsapp-barcode-generator.component.html',
  styleUrls: ['./whatsapp-barcode-generator.component.css']
})



export class WhatsappBarcodeGeneratorComponent implements OnInit {

  @Input() visible: boolean=false;
  @Input() contact: Contact={};
  messages: Message[]=[];
  whatsapp:WhatsAppGenerator={}
  phoneNumbers: Mobile[] =[]; 
  selectedPhoneNumber: Mobile | undefined;
  qrBarcode:string |undefined;
  canGenerateBarCode:boolean=true;

  constructor(private contactService:ContactService) {
   
  }
  ngOnInit() {

        if(this.contact.phone_number)
        this.phoneNumbers.push({"phone":this.contact.phone_number,"id":'1'} )
        
        if(this.contact.phone_number2)
        this.phoneNumbers.push({"phone":this.contact.phone_number2,"id":'2'})

        if(this.contact.phone_number3)
        this.phoneNumbers.push({"phone":this.contact.phone_number3,"id":'3'})

        
    }

  hide()
  {
    this.contact.visible=false;
    this.qrBarcode=undefined;
    this.whatsapp.phoneNumberText=undefined;
    this.selectedPhoneNumber=undefined;

  }
  clearText()
  {
    this.whatsapp.phoneNumberText=undefined
  }
  clearRadios()
  {
    this.selectedPhoneNumber=undefined;
  }
  generateQrCode()
  {

    if (this.whatsapp.phoneNumberText!=null)
     this.selectedPhoneNumber=undefined;

    const phone=this.whatsapp.phoneNumberText !=null? this.whatsapp.phoneNumberText: this.selectedPhoneNumber?.phone;
    if (phone)
    {
      this.canGenerateBarCode=true;
      this.contactService.createBarCode(phone)
    .subscribe(response=>{
       this.qrBarcode=response;
       this.messages = [{ severity: 'success', summary: 'Now you can scan the barcode with your phone!'}]; 

       
    })
    }
    else {
      this.canGenerateBarCode=false;
      this.qrBarcode=undefined;
      this.messages = [{ severity: 'error', summary: 'Add a phone number or select one!'}];
    }
     
  }
  formatPhoneNumber(phone: string): string {
    const formattedNumber = `(${phone.substring(0, 3)})-${phone.substring(3, 6)}-${phone.substring(6)}`;
    return formattedNumber;
  }
}
