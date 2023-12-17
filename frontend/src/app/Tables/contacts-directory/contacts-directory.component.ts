import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { FilterMetadata } from 'primeng/api';
import { Table } from 'primeng/table';
import { BehaviorSubject } from 'rxjs';
import { Contact } from 'src/app/Dtos/Contact';
import { AuthService } from 'src/app/Services/auth.service';
import { ContactService } from 'src/app/Services/contact.service';
import Swal from 'sweetalert2';
import * as FileSaver from 'file-saver';


@Component({
  selector: 'app-contacts-directory',
  templateUrl: './contacts-directory.component.html',
  styleUrls: ['./contacts-directory.component.css']
})
export class ContactsDirectoryComponent {
  users: Contact[] = [];
  searchInput:string=''
  isShareDialogOpen: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  contactName:string=""
  contactId?:number;
  relationships:string[]=[]
  constructor(private contactsService:ContactService,
              private authService:AuthService,
              private router: Router) { }

  ngOnInit() {
    const relationships=this.contactsService.getRelationShipTypes();

    relationships.unshift('None');
    this.relationships=relationships;
    console.log("relationships",this.relationships)
    this.getContacts();
  }
  filterRelationship(value: any, filter: FilterMetadata): boolean {
    if (filter.value === undefined || filter.value === null) {
      return true;
    }
  
    return value === filter.value;
  }
  getContacts()
  {
    const id = this.authService.getLoginInfo();
    if (id)
    this.contactsService.getContacts(parseInt(id))
    .subscribe(response=>{
      this.users=response;

    this.setNone()
    console.log(response)
  });
  }

  setNone()
  {
    this.users.forEach(user=>{
      if (user.relationship===null||user.relationship===undefined)
        user.relationship='None';
      });
  }

  clear(table: Table) {
    this.searchInput = '';
    table.clear();
  }
  passToTrash(contactId:number)
  {
    Swal.fire({
      title: "Are you sure you want delete the contact?",
      text: "This contact will be move it to the trash can in case you want to revert it",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, move to trash!"
    }).then((result) => {
      if (result.isConfirmed) {
       const userId = this.authService.getLoginInfo();
        if (userId)
        this.contactsService.moveContactToTrash(parseInt(userId),contactId)
      .subscribe(response=>{
        this.contactsService.getContacts(parseInt(userId))
        .subscribe(response=>{this.users=response;  this.setNone();});
          Swal.fire({
            title: "Deleted!",
            text: "Your contact has been moved to the trash can .",
            icon: "success"
          });
          
      })
        
      }
    });
  }

  viewContact(contact_id:number)
  {
    this.router.navigate(['/dashboard/view-contact',contact_id]);
  }

  editContact(contact_id:number)
  {
    this.router.navigate(['/dashboard/edit-contact',contact_id]);
  }
  openShareDialog(contact:Contact)
  {
    this.contactName=contact.first_name +" "+contact.last_name;
    this.contactId=contact.id;
    this.isShareDialogOpen.next(true);
  }
  getSeverity(relationshipType: string) {
    switch (relationshipType) {
        case 'None':
            return 'danger';

        case 'Family':
            return 'success';

        case 'Coworker':
            return 'info';

        case 'School':
            return 'warning';

        case 'Friend':
            return 'info';
        

    }
    return undefined;
}
exportPdf() {
  const infoToExport=this.getInfoToExport()
  const cols = [
    { field: 'first_name', header: 'First Name' },
    { field: 'last_name', header: 'Last Name' },
    { field: 'email', header: 'Email' },
    { field: 'relationship', header: 'Relationship' },
    { field: 'phone_number', header: 'Phone Number' },
    { field: 'phone_type', header: 'Phone Type' }, 
    { field: 'phone_number2', header: 'Phone Number 2' },
    { field: 'phone_type2', header: 'Phone Type 2' },
    { field: 'phone_number3', header: 'Phone Number 3' },
    { field: 'phone_type3', header: 'Phone Type 3' }
];

const fields = ['First Name', 'Last Name', 'Email', 
                'Relationship', 'Phone Number', 'Phone Type', 
                'Phone Number 2', 'Phone Type 2', 'Phone Number 3', 'Phone Type 3'];

console.log(this.getInfoToExportPDF())
import('jspdf').then((jsPDF) => {
  import('jspdf-autotable').then((x) => {
    const doc = new jsPDF.default('p', 'px', 'a4');
   
    (doc as any).autoTable({
      head: [fields],
      body: this.getInfoToExportPDF(),
      styles: { columnWidth: 42 }, 
    });
    doc.save('contacts.pdf');
  });
});
}
getInfoToExportPDF():any[]
{
  return this.users.map(user=>
    [user.first_name,
    user.last_name,
    user.email,
    user.relationship,
    user.phone_number,
    user.phone_type,
    user.phone_number2,
    user.phone_type2,
    user.phone_number3,
    user.phone_type3
    ]
  )

}

getInfoToExport()
{
  return this.users.map(user=>{
    return {'first_name':user.first_name,
    'last_name':user.first_name,
    'email':user.email,
    'relationship':user.relationship,
    'phone_number':user.phone_number,
    'phone_type':user.phone_type,
    'phone_number2':user.phone_number2,
    'phone_type2':user.phone_type2,
    'phone_number3':user.phone_number3,
    'phone_type3':user.phone_type3,
    }
  })
}


exportExcel() {
  
  const infoToExport=this.getInfoToExport()
  import('xlsx').then((xlsx) => {
      const worksheet = xlsx.utils.json_to_sheet(infoToExport);
      const workbook = { Sheets: { data: worksheet }, SheetNames: ['data'] };
      const excelBuffer: any = xlsx.write(workbook, { bookType: 'xlsx', type: 'array' });
      this.saveAsExcelFile(excelBuffer, 'contacts');
      
  });
}
exportCSV() {
  
  const infoToExport=this.getInfoToExport()
  import('xlsx').then((xlsx) => {
      const worksheet = xlsx.utils.json_to_sheet(infoToExport);
      const workbook = { Sheets: { data: worksheet }, SheetNames: ['data'] };
      const excelBuffer: any = xlsx.write(workbook, { bookType: 'xlsx', type: 'array' });
      const CSV_TYPE ='text/csv;charset=utf-8';
      const CSV_EXTENSION = '.csv';
      const csvOutput: string = xlsx.utils.sheet_to_csv(worksheet);
      const fileName="contacts";
      FileSaver.saveAs(new Blob([csvOutput]), `${fileName}_export_${new Date().getTime()}${CSV_EXTENSION}`)
      
  });
}

saveAsExcelFile(buffer: any, fileName: string): void {
  let EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
  let EXCEL_EXTENSION = '.xlsx';
  const data: Blob = new Blob([buffer], {
      type: EXCEL_TYPE
  });
  
  FileSaver.saveAs(data, fileName + '_export_' + new Date().getTime() + EXCEL_EXTENSION);
}
}
