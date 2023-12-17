import { Component } from '@angular/core';
import { Table } from 'primeng/table';
import { Contact } from 'src/app/Dtos/Contact';
import { AuthService } from 'src/app/Services/auth.service';
import { ContactService } from 'src/app/Services/contact.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-trash-directory',
  templateUrl: './trash-directory.component.html',
  styleUrls: ['./trash-directory.component.css']
})
export class TrashDirectoryComponent {
  
  users: Contact[] = [];
  searchInput:string=''
  constructor(private contactsService:ContactService,
    private authService:AuthService) { }

  ngOnInit() {
   this.getContacts()
  }
  getContacts()
  {
    const id = this.authService.getLoginInfo();
    if (id)
    this.contactsService.getTrashContacts(parseInt(id))
    .subscribe(response=>{this.users=response;});
  }
  clear(table: Table) {
    this.searchInput = '';
    table.clear();
  }

  recover(contactId:number)
  {
    Swal.fire({
      title: "Are you sure you want to recover the contact?",
      text: "This contact will be move it to your directory",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, recover it!"
    }).then((result) => {
      if (result.isConfirmed) {
        const userId = this.authService.getLoginInfo();
        if (userId)
        this.contactsService.recoverContactFromTrash(parseInt(userId),contactId)
        .subscribe(response=>{
          this.contactsService.getTrashContacts(parseInt(userId))
          .subscribe(response=>{
            this.users=response;
            Swal.fire({
              title: "Recovered!",
              text: "Your contact has been recovered.",
              icon: "success"
            });
          });
        })
        
      }
    });
  }


  delete(contactId:number)
  {
    Swal.fire({
      title: "Are you sure you want delete the contact?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!"
    }).then((result) => {
      if (result.isConfirmed) {
        const userId = this.authService.getLoginInfo();
        if (userId)
        this.contactsService.deleteContact(parseInt(userId),contactId)
        .subscribe(response=>{
          this.contactsService.getTrashContacts(parseInt(userId))
          .subscribe(response=>{
            this.users=response;
            Swal.fire({
              title: "Deleted!",
              text: "Your contact has been deleted.",
              icon: "success"
            });
          });
        })
       
        
      }
    });
  }
}
