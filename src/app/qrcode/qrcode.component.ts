import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  AfterViewInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonButton,
  IonIcon,
  IonList,
  IonItem,
  IonLabel,
} from '@ionic/angular/standalone';
import QRCode from 'qrcode';
import { ContactService, ContactInfo } from '../services/contact.service';
import { Share } from '@capacitor/share';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-qrcode',
  templateUrl: './qrcode.component.html',
  styleUrls: ['./qrcode.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButtons,
    IonButton,
    IonIcon,
    IonList,
    IonItem,
    IonLabel,
  ],
})
export class QRCodeComponent implements OnInit, AfterViewInit {
  @ViewChild('qrCanvas') qrCanvas!: ElementRef<HTMLCanvasElement>;
  contacts: ContactInfo[] = [];

  constructor(private contactService: ContactService) {}

  ngOnInit() {
    this.contactService.contacts$.subscribe((contacts) => {
      this.contacts = contacts;
      if (this.contacts.length > 0) {
        this.generateQRCode();
      }
    });
  }

  ngAfterViewInit() {
    if (this.contacts.length > 0) {
      this.generateQRCode();
    }
  }

  private async generateQRCode() {
    if (!this.qrCanvas) return;

    // Create a data structure that includes all contact information
    const contactData = {
      version: '1.0',
      timestamp: new Date().toISOString(),
      contacts: this.contacts.map((contact) => ({
        type: contact.type,
        label: contact.label,
        value: contact.value,
        icon: contact.icon,
        color: contact.color || 'primary',
      })),
    };

    // Encode the data as base64
    const encoded = btoa(JSON.stringify(contactData));
    // Build the URL to the hosted contact page
    const url = `${environment.contactPageUrl}?data=${encoded}`;

    try {
      await QRCode.toCanvas(this.qrCanvas.nativeElement, url, {
        width: 300,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#ffffff',
        },
      });
    } catch (error) {
      console.error('Error generating QR code:', error);
    }
  }

  private getContactAction(contact: ContactInfo): string {
    switch (contact.type) {
      case 'email':
        return `mailto:${contact.value}`;
      case 'phone':
        return `tel:${contact.value}`;
      case 'linkedin':
        return `https://linkedin.com/in/${contact.value}`;
      case 'twitter':
        return `https://twitter.com/${contact.value}`;
      case 'instagram':
        return `https://instagram.com/${contact.value}`;
      case 'facebook':
        return `https://facebook.com/${contact.value}`;
      case 'website':
        return contact.value.startsWith('http')
          ? contact.value
          : `https://${contact.value}`;
      default:
        return contact.value;
    }
  }

  async downloadQR() {
    if (!this.qrCanvas) return;

    try {
      const canvas = this.qrCanvas.nativeElement;
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = 'business-card-qr.png';
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error('Error downloading QR code:', error);
    }
  }

  async shareQR() {
    if (!this.qrCanvas) return;

    try {
      const canvas = this.qrCanvas.nativeElement;
      const dataUrl = canvas.toDataURL('image/png');

      await Share.share({
        title: 'My Digital Business Card',
        text: 'Check out my digital business card!',
        url: dataUrl,
        dialogTitle: 'Share your business card',
      });
    } catch (error) {
      console.error('Error sharing QR code:', error);
    }
  }
}
