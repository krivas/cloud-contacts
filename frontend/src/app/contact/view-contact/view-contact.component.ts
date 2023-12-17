import { Component, OnInit } from '@angular/core';
import { CreateContact } from '../../Dtos/CreateContact';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../Services/auth.service';
import { ContactService } from '../../Services/contact.service';

@Component({
  selector: 'app-view-contact',
  templateUrl: './view-contact.component.html',
  styleUrls: ['./view-contact.component.css']
})
export class ViewContactComponent implements OnInit {
  selectedFileUrl: string|undefined;

  constructor(private route: ActivatedRoute,
              private auth:AuthService,
              private contactService:ContactService,
              private router: Router) {}

  areInputsDisabled=true;
  contact: CreateContact={ };
  phoneNumbers:string[]=[]
  phoneTypes:string[]=[]
  relationships:string[]|undefined;
  labels:string[]|undefined;

  
  ngOnInit(): void {
    this.labels= this.contactService.getPhoneTypes();
    this.relationships=this.contactService.getRelationShipTypes();
    
    this.route.params.subscribe(params => {
        const contactId= params['id'];
        const userId=this.auth.getLoginInfo();
        if (userId)
       this.contactService.getContactsByUserIdAndContactId(parseInt(userId),contactId)
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
  
  goToContacts()
  {
    this.router.navigate(["/dashboard/contacts"])
  }


}
