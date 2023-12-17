import { Component, Input, OnChanges, SimpleChanges, ViewChild,OnInit } from '@angular/core';
import { MessageService } from 'primeng/api';
import { Table } from 'primeng/table';
import { BehaviorSubject, empty } from 'rxjs';
import { User } from 'src/app/Dtos/User';
import { UserGet } from 'src/app/Dtos/UserGet';
import { AuthService } from 'src/app/Services/auth.service';
import { ContactService } from 'src/app/Services/contact.service';

@Component({
  selector: 'app-share-contacts',
  templateUrl: './share-contacts.component.html',
  styleUrls: ['./share-contacts.component.css']
})
export class ShareContactsComponent  implements OnInit{
  
  constructor(private auth:AuthService,private contactService:ContactService,
    private messageService: MessageService){}
  
  @ViewChild('shareTable') table!: Table;
  visible:boolean=false;
  users: UserGet[] = [];
  searchInput:string=''
  selectedUsers!: UserGet[]|null;
  @Input()  isOpen: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  @Input()  contactName: string='';
  @Input()  contactId?: number;

  ngOnInit(): void {
    this.isOpen.subscribe(response=>{this.visible=response})
    const userId=localStorage.getItem("user");
    if (userId)
    this.auth.getUsers(parseInt(userId)).subscribe((response)=>{this.users=response;console.log(this.users)})
  }
  

  hide()
  {
    this.selectedUsers=[];
    this.isOpen.next(false);
    this.searchInput="";
    this.table.clear();
    this.table.reset();
  }

  shareContact()
  {
    const user_ids=this.selectedUsers?.map(response=>{return response.id})
    console.log(user_ids)
    debugger
    if (this.contactId && user_ids)
    {
      console.log(this.contactId)
      console.log(user_ids)

      this.contactService.shareContact(this.contactId,user_ids)
    .subscribe(response=>{
      this.messageService.add({ severity: 'success', summary: 'Success', detail: this.contactName  + ' has been shared!' });
      this.hide();
    })
    }
    
    
    
  }

  clear(table: Table) {
    this.searchInput = '';
    table.clear();
    this.table.reset();
  }
  
}
