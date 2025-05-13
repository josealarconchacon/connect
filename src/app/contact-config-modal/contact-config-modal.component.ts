import { Component, Input } from '@angular/core';
import { IonicModule, ModalController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { addIcons } from 'ionicons';
import { closeOutline } from 'ionicons/icons';

interface ContactCard {
  id: string;
  label: string;
  icon: string;
  color?: string;
  contactInfo?: string;
  isConfigured: boolean;
  type: 'default' | 'custom';
}

@Component({
  selector: 'app-contact-config-modal',
  templateUrl: './contact-config-modal.component.html',
  styleUrls: ['./contact-config-modal.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
})
export class ContactConfigModalComponent {
  @Input() card!: ContactCard;
  contactInfo: string = '';

  constructor(private modalCtrl: ModalController) {
    // Register icons used in the modal
    addIcons({
      closeOutline,
    });
  }

  getPlaceholder(): string {
    switch (this.card.id) {
      case 'phone':
        return '+1 555 123 4567';
      case 'email':
        return 'john.doe@example.com';
      case 'website':
        return 'https://example.com';
      case 'linkedin':
        return 'linkedin.com/in/username';
      case 'github':
        return 'github.com/username';
      case 'twitter':
        return '@username';
      case 'instagram':
        return '@username';
      default:
        return 'Enter your contact information';
    }
  }

  async save() {
    if (!this.contactInfo.trim()) {
      // Show error toast or validation message
      return;
    }

    await this.modalCtrl.dismiss({
      contactInfo: this.contactInfo.trim(),
    });
  }

  cancel() {
    this.modalCtrl.dismiss();
  }
}
