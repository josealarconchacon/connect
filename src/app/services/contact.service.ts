import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface ContactInfo {
  id: string;
  type: string;
  label: string;
  value: string;
  icon: string;
  color?: string;
}

@Injectable({
  providedIn: 'root',
})
export class ContactService {
  private contacts = new BehaviorSubject<ContactInfo[]>([]);
  contacts$ = this.contacts.asObservable();

  constructor() {
    // Load contacts from storage if available
    const savedContacts = localStorage.getItem('contacts');
    if (savedContacts) {
      this.contacts.next(JSON.parse(savedContacts));
    }
  }

  addContact(contact: ContactInfo) {
    const currentContacts = this.contacts.value;
    const updatedContacts = [...currentContacts, contact];
    this.contacts.next(updatedContacts);
    this.saveToStorage(updatedContacts);
  }

  updateContact(contact: ContactInfo) {
    const currentContacts = this.contacts.value;
    const index = currentContacts.findIndex((c) => c.id === contact.id);
    if (index !== -1) {
      currentContacts[index] = contact;
      this.contacts.next([...currentContacts]);
      this.saveToStorage(currentContacts);
    }
  }

  deleteContact(id: string) {
    const currentContacts = this.contacts.value;
    const updatedContacts = currentContacts.filter((c) => c.id !== id);
    this.contacts.next(updatedContacts);
    this.saveToStorage(updatedContacts);
  }

  private saveToStorage(contacts: ContactInfo[]) {
    localStorage.setItem('contacts', JSON.stringify(contacts));
  }

  getContactsAsJson(): string {
    return JSON.stringify(this.contacts.value);
  }
}
