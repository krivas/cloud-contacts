import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../Services/auth.service';
import { ContactService } from '../../Services/contact.service';

import { Contact } from '../../Dtos/Contact';
import { Message } from 'primeng/api';
import Swal from 'sweetalert2';
import { NgForm } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-edit-contact',
  templateUrl: './edit-contact.component.html',
  styleUrls: ['./edit-contact.component.css']
})
export class EditContactComponent {

  phoneNumbers:string[]=[]
  messages: Message[]=[];
  areInputsDisabled=true;
  contactId:number=0;
  contact: Contact={ };
  phoneNumberPattern: string = '^[0-9]{10}$';
  labels:string[]|undefined;
  relationships:string[]|undefined;
  phoneTypes:string[]=[]

  constructor(private route: ActivatedRoute,
    private auth:AuthService,
    private contactService:ContactService,
    private router: Router) {}
    selectedFileUrl: string |undefined;
    selectedFile:File|undefined;
  
  ngOnInit(): void {
    this.labels= this.contactService.getPhoneTypes();
    this.relationships=this.contactService.getRelationShipTypes();
    this.route.params.subscribe(params => {
        this.contactId= params['id'];
        const userId=this.auth.getLoginInfo();
        if (userId)
       this.contactService.getContactsByUserIdAndContactId(parseInt(userId),this.contactId)
      .subscribe(response=>{
        console.log(response);
        this.contact=response
        if (this.contact.phone_number2!=null)
        {
          this.phoneNumbers.push(this.contact.phone_number2)
          if (this.contact.phone_type2)
          this.phoneTypes.push(this.contact.phone_type2)
        }

        if (this.contact.phone_number3!=null)
        {
          this.phoneNumbers.push(this.contact.phone_number3)
          if (this.contact.phone_type3)
          this.phoneTypes.push(this.contact.phone_type3)
        }
        if (response.image_path && response.id)
        {
          this.contactService.getContactPicture(response.id).subscribe(photo=>{
            this.selectedFileUrl=`data:image/${photo.extension};base64,${photo.image}`;
          });
        }
        
      })
    });
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

  goToContacts()
  {
    this.router.navigate(["/dashboard/contacts"])
  }
  
  trackByFn(index:number, item:string) {
    return index;  
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

  }
  deletePhoneNumber(index:number)
  {
    if(index >= 0 && index < this.phoneNumbers.length) 
    {
      this.phoneNumbers.splice(index, 1);
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
    this.contactService.editContact(this.contactId,this.contact)
    .subscribe(response=>
     {
      debugger
      if (this.selectedFile!=undefined && response.id  )
      {
        this.contactService.saveContactPicture(response.id,this.selectedFile)
        .subscribe(response=>{
          this.messages = [{ severity: 'success', summary: 'Contact updated'}]; 
          // contactForm.resetForm();
          // this.phoneNumbers.splice(0,this.phoneNumbers.length)
          // this.selectedFile=undefined;
          // this.selectedFileUrl=undefined;
        })
      }
      else
      {
        this.messages = [{ severity: 'success', summary: 'Contact updated'}]; 
        // contactForm.resetForm();
        // this.phoneNumbers.splice(0,this.phoneNumbers.length);
        // this.selectedFile=undefined;
        //   this.selectedFileUrl=undefined;
      }
     },(error: HttpErrorResponse) => {
       console.log(error);
     })
   }
  
  }
}
