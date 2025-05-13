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
  IonSelect,
  IonSelectOption,
  IonText,
} from '@ionic/angular/standalone';
import QRCode from 'qrcode';
import { ContactService, ContactInfo } from '../services/contact.service';
import { Share } from '@capacitor/share';
import { environment } from '../../environments/environment';
import { FormsModule } from '@angular/forms';

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
    IonSelect,
    IonSelectOption,
    IonText,
    FormsModule,
  ],
})
export class QRCodeComponent implements OnInit, AfterViewInit {
  @ViewChild('qrCanvas') qrCanvas!: ElementRef<HTMLCanvasElement>;
  contacts: ContactInfo[] = [];
  selectedContactIndex: number = 0;
  vCardString: string = '';
  showSuccess: boolean = false;

  constructor(private contactService: ContactService) {}

  ngOnInit() {
    this.contactService.contacts$.subscribe((contacts) => {
      this.contacts = contacts;
      if (
        this.contacts.length > 0 &&
        this.selectedContactIndex >= this.contacts.length
      ) {
        this.selectedContactIndex = 0;
      }
      this.generateQRCode();
    });
  }

  ngAfterViewInit() {
    if (this.contacts.length > 0) {
      this.generateQRCode();
    }
  }

  onContactChange() {
    this.generateQRCode();
  }

  private async generateQRCode() {
    if (!this.qrCanvas) return;
    if (!this.contacts.length) return;

    const contact = this.contacts[this.selectedContactIndex];
    const vCard = this.generateVCard(contact);
    this.vCardString = vCard;
    this.showSuccess = false;

    try {
      await QRCode.toCanvas(this.qrCanvas.nativeElement, vCard, {
        width: 300,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#ffffff',
        },
      });
      this.showSuccess = true;
    } catch (error) {
      console.error('Error generating QR code:', error);
    }
  }

  private generateVCard(contact: ContactInfo): string {
    let vCard = 'BEGIN:VCARD\nVERSION:3.0\n';
    if (contact.label) vCard += `FN:${contact.label}\\n`;
    if (contact.type === 'phone' || contact.icon === 'call-outline') {
      vCard += `TEL;TYPE=CELL:${contact.value}\\n`;
    }
    if (contact.type === 'email' || contact.icon === 'mail-outline') {
      vCard += `EMAIL:${contact.value}\\n`;
    }
    if (contact.type === 'website' || contact.icon === 'globe-outline') {
      vCard += `URL:${contact.value}\\n`;
    }
    if (contact.type === 'linkedin' || contact.icon === 'logo-linkedin') {
      vCard += `URL;TYPE=LinkedIn:${contact.value}\\n`;
    }
    if (contact.type === 'twitter' || contact.icon === 'logo-twitter') {
      vCard += `URL;TYPE=Twitter:${contact.value}\\n`;
    }
    if (contact.type === 'instagram' || contact.icon === 'logo-instagram') {
      vCard += `URL;TYPE=Instagram:${contact.value}\\n`;
    }
    if (contact.type === 'facebook' || contact.icon === 'logo-facebook') {
      vCard += `URL;TYPE=Facebook:${contact.value}\\n`;
    }
    if ((contact as any).address) {
      vCard += `ADR:${(contact as any).address}\\n`;
    }
    if ((contact as any).org) {
      vCard += `ORG:${(contact as any).org}\\n`;
    }
    if ((contact as any).title) {
      vCard += `TITLE:${(contact as any).title}\\n`;
    }
    if ((contact as any).notes) {
      vCard += `NOTE:${(contact as any).notes}\\n`;
    }
    if (contact.type === 'default' && contact.value) {
      vCard += `NOTE:${contact.value}\\n`;
    }
    vCard += 'END:VCARD';
    return vCard;
  }

  private generateMultiVCard(contacts: ContactInfo[]): string {
    return contacts.map((contact) => this.generateVCard(contact)).join('\n');
  }

  copyVCard() {
    const allVCard = this.generateMultiVCard(this.contacts);
    navigator.clipboard.writeText(allVCard);
    this.showSuccess = true;
    setTimeout(() => (this.showSuccess = false), 2000);
  }

  downloadVCard() {
    const allVCard = this.generateMultiVCard(this.contacts);
    const blob = new Blob([allVCard.replace(/\\n/g, '\n')], {
      type: 'text/vcard',
    });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'contacts.vcf';
    link.click();
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
