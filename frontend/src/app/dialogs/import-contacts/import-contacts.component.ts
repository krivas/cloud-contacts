import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { MessageService } from 'primeng/api';
import { BehaviorSubject } from 'rxjs';
import { AuthService } from 'src/app/Services/auth.service';
import { ContactService } from 'src/app/Services/contact.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-import-contacts',
  templateUrl: './import-contacts.component.html',
  styleUrls: ['./import-contacts.component.css']
})


export class ImportContactsComponent implements OnInit {
  constructor(private contactService:ContactService,private authService:AuthService,
    private messageService: MessageService){}
  ngOnInit(): void {
    this.isOpen.subscribe(response=>{this.visible=response})
  }
  visible:boolean=false;
  isUploading:boolean=false;
  @Input()  isOpen: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  @ViewChild('fileInput') fileInput: HTMLInputElement | undefined;
  fileName:string|undefined
  file:File|undefined;
  hide(fileInput:HTMLInputElement)
  {
    this.isOpen.next(false);
    this.file=undefined;
    this.fileName="";
    fileInput.value='';
    this.isUploading=false;

  }

  clickFileInput(fileInput:HTMLInputElement)
  {
   fileInput.click()
  }
  handleFileSelection(event: any): void {
    const file:File = event.target.files && event.target.files[0];
    console.log("handileFile ",file)
    if (file) {
      this.file=file;
      this.fileName=file.name;
    }
  }
  import()
  {
    this.isUploading=true;
    setTimeout(() => {
      if (this.file)
      {
  
       const id=this.authService.getLoginInfo();
       if (id)
       this.contactService.uploadCSVFile(parseInt(id),this.file)
      .subscribe(response=>{
        this.isUploading=false;
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Contacts uploaded' });
        if (this.fileInput)
        this.hide(this.fileInput)
      })
      }
    }, 5000);
   

  }
}
