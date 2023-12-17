import { Component, OnInit, ViewChild } from '@angular/core';
import { Contact } from '../../Dtos/Contact';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Message } from 'primeng/api';
import { ContactService } from '../../Services/contact.service';
import { CreateContact } from '../../Dtos/CreateContact';
import { NgForm } from '@angular/forms';
import { AuthService } from '../../Services/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-create-contact',
  templateUrl: './create-contact.component.html',
  styleUrls: ['./create-contact.component.css']
})
export class CreateContactComponent implements OnInit  {

  @ViewChild('fileInput') fileInput!: any;
  contact: CreateContact={ };
  phoneNumbers:string[]=[]
  phoneTypes:string[]=[]
  messages: Message[]=[];
  phoneNumberPattern: string = '^[0-9]{10}$';
  selectedFileUrl: string |undefined;
  selectedFile:File|undefined;
  labels:string[]|undefined;
  relationships:string[]|undefined;
  constructor(private contactService:ContactService,
    private auth:AuthService){}

  ngOnInit(): void {
    this.labels= this.contactService.getPhoneTypes();
    this.relationships=this.contactService.getRelationShipTypes();
  }
 
  
  
  trackByFn(index:number, item:string) {
    return index;  
  }

  choose(fileInput:HTMLInputElement)
  {
    fileInput.click()
  }
  handleFileSelection(event: any): void {
    console.log("hi ",event)
    const file = event.target.files && event.target.files[0];
    console.log("hi ",event)
    console.log("handileFile ",file)
    if (file) {
      this.previewSelectedFile(file);
    }
  }

  previewSelectedFile(file: File): void {
    const reader = new FileReader();
    reader.onload = (e) => {
      
      this.selectedFileUrl = e.target?.result as string;
      console.log(this.selectedFileUrl)
    };
    this.selectedFile=file;
    reader.readAsDataURL(file);
  }

  addPhoneNumber() {
    if (this.phoneNumbers.length>1)
    {
      Swal.fire({
        title: "Oops",
        text: "You cannot add more than 3 phone numbers!",
        icon: "warning",
        confirmButtonColor: "#3085d6",
      });
      return;
    }
    this.phoneNumbers?.push('');
    this.phoneTypes?.push('')

  }
  deletePhoneNumber(index:number)
  {
    if(index >= 0 && index < this.phoneNumbers.length) 
    {
      this.phoneNumbers.splice(index, 1);
      this.phoneTypes.splice(index,1);
    }
  }
  validatePhoneNumbers(): boolean {
    if (this.phoneNumbers.length>0)
      return  this.phoneNumbers.every(phoneNumber => /^\d{10}$/.test(phoneNumber));
    else 
      return true
   
  }
  addContact(contactForm:NgForm)
  {

   if(contactForm.valid && this.validatePhoneNumbers())
   {
    const id=this.auth.getLoginInfo();
    if (id)
    this.contact.user_id=parseInt(id)
    this.contact.phone_number2=this.phoneNumbers.length>0?this.phoneNumbers[0]:undefined
    this.contact.phone_number3=this.phoneNumbers.length>=1?this.phoneNumbers[1]:undefined
    this.contact.phone_type2=this.phoneTypes.length>0?this.phoneTypes[0]:undefined
    this.contact.phone_type3=this.phoneNumbers.length>1?this.phoneTypes[1]:undefined
    this.contactService.addContact(this.contact)
    .subscribe(response=>
     {
      if (this.selectedFile!=undefined && response.id  )
      {
        this.contactService.saveContactPicture(response.id,this.selectedFile)
        .subscribe(response=>{
          this.messages = [{ severity: 'success', summary: 'Contact added'}]; 
          contactForm.resetForm();
          this.phoneNumbers.splice(0,this.phoneNumbers.length)
          this.selectedFile=undefined;
          this.selectedFileUrl=undefined;
        })
      }
      else
      {
        this.messages = [{ severity: 'success', summary: 'Contact added'}]; 
        contactForm.resetForm();
        this.phoneNumbers.splice(0,this.phoneNumbers.length);
        this.selectedFile=undefined;
          this.selectedFileUrl=undefined;
      }
      
     },(error: HttpErrorResponse) => {
       console.log(error);
     })
   }
  
  }
}
