import { Component } from '@angular/core';
import { Table } from 'primeng/table';
import { Contact } from 'src/app/Dtos/Contact';
import { AuthService } from 'src/app/Services/auth.service';
import { ContactService } from 'src/app/Services/contact.service';

@Component({
  selector: 'app-qrcode-directory',
  templateUrl: './qrcode-directory.component.html',
  styleUrls: ['./qrcode-directory.component.css']
})
export class QrcodeDirectoryComponent {

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
    this.contactsService.getContacts(parseInt(id))
    .subscribe(response=>{this.users=response;});
  }

  clear(table: Table) {
    this.searchInput = '';
    table.clear();
  }
  showDialog(user:Contact)
  {
    user.visible=true;
  }
}
