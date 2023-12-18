import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Contact } from '../Dtos/Contact';
import { CreateContact } from '../Dtos/CreateContact';
import { Photo } from '../Dtos/Photo';
import { Observable, of } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ContactService {

  private domain:string| undefined;
  private endpoint:string | undefined;

  constructor(
    private http: HttpClient
  ) {
    this.domain=`https://cloud-contacts-backend.azurewebsites.net`;
    this.endpoint='contacts';
  }
  addContact(contact:CreateContact) {
    return this.http.post<Contact>(`${this.domain}/${this.endpoint}`,contact);
  }

  editContact(contactId:number,contact:Contact) {
    return this.http.put<Contact>(`${this.domain}/${this.endpoint}/edit/${contactId}`,contact);
  }

  getContactsByUserIdAndContactId(user_id:number,contact_id:number) {
    return this.http.get<Contact>(`${this.domain}/${this.endpoint}/${user_id}/${contact_id}`);
  }

  getContacts(user_id:number) {
    return this.http.get<Contact[]>(`${this.domain}/${this.endpoint}/${user_id}`);
  }

  getTrashContacts(user_id:number) {
    return this.http.get<Contact[]>(`${this.domain}/${this.endpoint}/trash/${user_id}`);
  }

  moveContactToTrash(user_id:number,contactId:number) {
    return this.http.delete(`${this.domain}/${this.endpoint}/soft/${user_id}/${contactId}`);
  }

  recoverContactFromTrash(user_id:number,contactId:number) {
    return this.http.put(`${this.domain}/${this.endpoint}/recover/${user_id}/${contactId}`,null);
  }
  deleteContact(user_id:number,contactId:number) {
    return this.http.delete(`${this.domain}/${this.endpoint}/hard/${user_id}/${contactId}`);
  }

  createBarCode(phoneNumber:string) {
    return this.http.post<string>(`${this.domain}/${this.endpoint}/create/whatsapp/barcode?phone_number=${phoneNumber}`,{});
  }

  shareContact(contact_id:number,contacts_ids:number[]) {
    const requestBody = { contacts: contacts_ids };
    console.log("ids ", contacts_ids)
    return this.http.post<string>(`${this.domain}/${this.endpoint}/share/${contact_id}`,contacts_ids);
  }
  getContactPicture(contact_id:number) {

    return this.http.get<Photo>(`${this.domain}/${this.endpoint}/profile/photo/${contact_id}`);
  }
  saveContactPicture(contact_id:number,file:File) {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.put<string>(`${this.domain}/${this.endpoint}/upload/profile/${contact_id}`,formData);
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
    return this.http.post<string>(`${this.domain}/${this.endpoint}/upload/csv/${userId}`,formData);
  }
}
