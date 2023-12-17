import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Contact } from '../Dtos/Contact';
import { CreateContact } from '../Dtos/CreateContact';
import { Photo } from '../Dtos/Photo';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ContactService {

  constructor(
    private http: HttpClient
  ) {}
  addContact(contact:CreateContact) {
    return this.http.post<Contact>("http://localhost:8000/contacts",contact);
  }

  editContact(contactId:number,contact:Contact) {
    return this.http.put<Contact>(`http://localhost:8000/contacts/edit/${contactId}`,contact);
  }

  getContactsByUserIdAndContactId(user_id:number,contact_id:number) {
    return this.http.get<Contact>(`http://localhost:8000/contacts/${user_id}/${contact_id}`);
  }

  getContacts(user_id:number) {
    return this.http.get<Contact[]>(`http://localhost:8000/contacts/${user_id}`);
  }

  getTrashContacts(user_id:number) {
    return this.http.get<Contact[]>(`http://localhost:8000/contacts/trash/${user_id}`);
  }

  moveContactToTrash(user_id:number,contactId:number) {
    return this.http.delete(`http://localhost:8000/contacts/soft/${user_id}/${contactId}`);
  }

  recoverContactFromTrash(user_id:number,contactId:number) {
    return this.http.put(`http://localhost:8000/contacts/recover/${user_id}/${contactId}`,null);
  }
  deleteContact(user_id:number,contactId:number) {
    return this.http.delete(`http://localhost:8000/contacts/hard/${user_id}/${contactId}`);
  }

  createBarCode(phoneNumber:string) {
    return this.http.post<string>(`http://localhost:8000/contacts/create/whatsapp/barcode?phone_number=${phoneNumber}`,{});
  }

  shareContact(contact_id:number,contacts_ids:number[]) {
    const requestBody = { contacts: contacts_ids };
    console.log("ids ", contacts_ids)
    return this.http.post<string>(`http://localhost:8000/contacts/share/${contact_id}`,contacts_ids);
  }
  getContactPicture(contact_id:number) {

    return this.http.get<Photo>(`http://localhost:8000/contacts/profile/photo/${contact_id}`);
  }
  saveContactPicture(contact_id:number,file:File) {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.put<string>(`http://localhost:8000/contacts/upload/profile/${contact_id}`,formData);
  }

  getPhoneTypes() {
    const phoneTypes: string[] = ["Mobile", "Home", "Work", "Other"];
    return phoneTypes;
  }
  getRelationShipTypes() {
    const relationships: string[] = ["Family", "Coworker", "School", "Friend","Partner"];

    return relationships;
  }
  uploadCSVFile(userId:number,file:File) :Observable<string>{
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<string>(`http://localhost:8000/contacts/upload/csv/${userId}`,formData);
  }
}
