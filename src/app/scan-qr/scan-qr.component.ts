import { Component, OnInit } from '@angular/core';
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
} from '@ionic/angular/standalone';
import { BarcodeScanner } from '@capacitor-community/barcode-scanner';
import { Browser } from '@capacitor/browser';

interface ContactInfo {
  type: string;
  label: string;
  value: string;
  icon: string;
  color?: string;
}

interface ScannedData {
  version: string;
  timestamp: string;
  contacts: ContactInfo[];
}

@Component({
  selector: 'app-scan-qr',
  templateUrl: './scan-qr.component.html',
  styleUrls: ['./scan-qr.component.scss'],
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
  ],
})
export class ScanQRComponent implements OnInit {
  isScanning: boolean = false;
  scanError: string | null = null;

  constructor() {}

  ngOnInit() {
    this.startScan();
  }

  async startScan() {
    try {
      this.isScanning = true;
      this.scanError = null;
      const result = await BarcodeScanner.startScan();
      if (result.hasContent) {
        await this.handleScannedData(result.content);
      }
    } catch (error) {
      console.error('Error scanning QR code:', error);
      this.scanError = 'Failed to scan QR code. Please try again.';
    } finally {
      this.isScanning = false;
    }
  }

  private async handleScannedData(content: string) {
    try {
      const data: ScannedData = JSON.parse(content);
      if (
        data.version &&
        Array.isArray(data.contacts) &&
        data.contacts.length > 0
      ) {
        // Create HTML content for the browser page
        const htmlContent = this.generateContactPage(data.contacts);

        // Create a data URL
        const dataUrl =
          'data:text/html;charset=utf-8,' + encodeURIComponent(htmlContent);

        // Open the browser with the contact page
        await Browser.open({
          url: dataUrl,
          presentationStyle: 'fullscreen',
        });
      } else {
        this.scanError = 'Invalid QR code format or no contacts found.';
      }
    } catch (error) {
      console.error('Error parsing QR code data:', error);
      this.scanError = 'Invalid QR code format.';
    }
  }

  private generateContactPage(contacts: ContactInfo[]): string {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Digital Business Card</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            margin: 0;
            padding: 20px;
            background: #f5f5f5;
            color: #333;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            border-radius: 16px;
            padding: 20px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          }
          h1 {
            text-align: center;
            color: #3880ff;
            margin-bottom: 30px;
          }
          .contact-list {
            display: flex;
            flex-direction: column;
            gap: 12px;
          }
          .contact-item {
            display: flex;
            align-items: center;
            padding: 16px;
            background: #f8f9fa;
            border-radius: 12px;
            text-decoration: none;
            color: inherit;
          }
          .contact-icon {
            width: 40px;
            height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #3880ff;
            color: white;
            border-radius: 50%;
            margin-right: 16px;
            font-size: 20px;
          }
          .contact-info {
            flex: 1;
          }
          .contact-label {
            font-weight: 600;
            margin: 0;
          }
          .contact-value {
            margin: 4px 0 0;
            color: #666;
            font-size: 14px;
          }
          .connect-button {
            background: #3880ff;
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 8px;
            cursor: pointer;
            font-weight: 500;
          }
          .connect-button:hover {
            background: #3171e0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Digital Business Card</h1>
          <div class="contact-list">
            ${contacts
              .map(
                (contact) => `
              <div class="contact-item">
                <div class="contact-icon" style="background: ${
                  contact.color || '#3880ff'
                }">
                  ${this.getIconEmoji(contact.icon)}
                </div>
                <div class="contact-info">
                  <h2 class="contact-label">${contact.label}</h2>
                  <p class="contact-value">${contact.value}</p>
                </div>
                <button class="connect-button" onclick="window.location.href='${this.getActionUrl(
                  contact
                )}'">
                  Connect
                </button>
              </div>
            `
              )
              .join('')}
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private getActionUrl(contact: ContactInfo): string {
    switch (contact.type) {
      case 'email':
        return `mailto:${contact.value}`;
      case 'phone':
        return `tel:${contact.value}`;
      case 'website':
        return contact.value.startsWith('http')
          ? contact.value
          : `https://${contact.value}`;
      case 'location':
        return `https://maps.google.com/?q=${encodeURIComponent(
          contact.value
        )}`;
      case 'social':
        return contact.value;
      default:
        return '#';
    }
  }

  private getIconEmoji(icon: string): string {
    const iconMap: { [key: string]: string } = {
      'mail-outline': '✉️',
      'call-outline': '📞',
      'logo-linkedin': '💼',
      'logo-twitter': '🐦',
      'logo-instagram': '📸',
      'logo-facebook': '👥',
      'globe-outline': '🌐',
      'location-outline': '📍',
      default: '🔗',
    };
    return iconMap[icon] || iconMap['default'];
  }

  async scanAgain() {
    this.scanError = null;
    await this.startScan();
  }
}
