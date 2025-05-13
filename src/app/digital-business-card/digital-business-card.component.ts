import { Component, OnInit } from '@angular/core';
import { IonicModule, ModalController, ToastController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { CustomContactTypeModalComponent } from '../custom-contact-type-modal/custom-contact-type-modal.component';
import { ContactConfigModalComponent } from '../contact-config-modal/contact-config-modal.component';
import { ContactService, ContactInfo } from '../services/contact.service';
import { addIcons } from 'ionicons';
import {
  checkmarkCircleOutline,
  addCircleOutline,
  callOutline,
  mailOutline,
  globeOutline,
  logoLinkedin,
  logoGithub,
  logoTwitter,
  logoInstagram,
  checkmarkCircle,
} from 'ionicons/icons';

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
  selector: 'app-digital-business-card',
  templateUrl: './digital-business-card.component.html',
  styleUrls: ['./digital-business-card.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule],
})
export class DigitalBusinessCardComponent implements OnInit {
  contactCards: ContactCard[] = [
    {
      id: 'phone',
      label: 'Phone',
      icon: 'call-outline',
      isConfigured: false,
      type: 'default',
    },
    {
      id: 'email',
      label: 'Email',
      icon: 'mail-outline',
      isConfigured: false,
      type: 'default',
    },
    {
      id: 'linkedin',
      label: 'LinkedIn',
      icon: 'logo-linkedin',
      isConfigured: false,
      type: 'default',
    },
    {
      id: 'github',
      label: 'GitHub',
      icon: 'logo-github',
      isConfigured: false,
      type: 'default',
    },
    {
      id: 'website',
      label: 'Website',
      icon: 'globe-outline',
      isConfigured: false,
      type: 'default',
    },
    {
      id: 'twitter',
      label: 'Twitter',
      icon: 'logo-twitter',
      isConfigured: false,
      type: 'default',
    },
    {
      id: 'instagram',
      label: 'Instagram',
      icon: 'logo-instagram',
      isConfigured: false,
      type: 'default',
    },
    {
      id: 'custom',
      label: 'Add Custom',
      icon: 'add-circle-outline',
      isConfigured: false,
      type: 'custom',
    },
  ];

  constructor(
    private modalCtrl: ModalController,
    private toastCtrl: ToastController,
    private contactService: ContactService
  ) {
    // Register all icons used in the component
    addIcons({
      checkmarkCircleOutline,
      addCircleOutline,
      callOutline,
      mailOutline,
      globeOutline,
      logoLinkedin,
      logoGithub,
      logoTwitter,
      logoInstagram,
      checkmarkCircle,
    });
  }

  ngOnInit() {
    // Load saved contacts from storage
    this.loadSavedContacts();
  }

  private async loadSavedContacts() {
    this.contactService.contacts$.subscribe((contacts) => {
      this.contactCards = this.contactCards.map((card) => {
        const savedContact = contacts.find((contact) => contact.id === card.id);
        if (savedContact) {
          return {
            ...card,
            contactInfo: savedContact.value,
            isConfigured: true,
          };
        }
        return card;
      });
    });
  }

  async handleCardClick(card: ContactCard): Promise<void> {
    if (card.id === 'custom') {
      await this.openCustomTypeModal();
    } else if (!card.isConfigured) {
      await this.configureContact(card);
    } else {
      // Handle configured contact click (e.g., copy to clipboard, open link)
      await this.handleConfiguredContactClick(card);
    }
  }

  private async configureContact(card: ContactCard): Promise<void> {
    const modal = await this.modalCtrl.create({
      component: ContactConfigModalComponent,
      componentProps: {
        card: card,
      },
      cssClass: 'contact-config-modal',
    });

    await modal.present();

    const { data } = await modal.onWillDismiss();
    if (data) {
      // Update the card with the new contact information
      const updatedCard = {
        ...card,
        contactInfo: data.contactInfo,
        isConfigured: true,
      };
      this.contactCards = this.contactCards.map((c) =>
        c.id === card.id ? updatedCard : c
      );

      // Save to ContactService
      const contactInfo: ContactInfo = {
        id: card.id,
        type: card.type,
        label: card.label,
        value: data.contactInfo,
        icon: card.icon,
      };
      this.contactService.addContact(contactInfo);

      // Show success message
      await this.showToast('Contact information saved successfully');
    }
  }

  private async handleConfiguredContactClick(card: ContactCard): Promise<void> {
    if (!card.contactInfo) return;

    switch (card.id) {
      case 'phone':
        window.location.href = `tel:${card.contactInfo}`;
        break;
      case 'email':
        window.location.href = `mailto:${card.contactInfo}`;
        break;
      case 'website':
        window.open(card.contactInfo, '_blank');
        break;
      default:
        // For social media and custom types
        if (card.contactInfo.startsWith('http')) {
          window.open(card.contactInfo, '_blank');
        } else {
          await this.copyToClipboard(card.contactInfo);
        }
    }
  }

  private async copyToClipboard(text: string): Promise<void> {
    try {
      await navigator.clipboard.writeText(text);
      await this.showToast('Copied to clipboard');
    } catch (err) {
      await this.showToast('Failed to copy to clipboard');
    }
  }

  private async showToast(message: string): Promise<void> {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2000,
      position: 'bottom',
      color: 'success',
    });
    await toast.present();
  }

  private async openCustomTypeModal(): Promise<void> {
    const modal = await this.modalCtrl.create({
      component: CustomContactTypeModalComponent,
      cssClass: 'custom-type-modal',
    });

    await modal.present();

    const { data } = await modal.onWillDismiss();
    if (data) {
      const newCard: ContactCard = {
        id: data.name.toLowerCase().replace(/\s+/g, '-'),
        label: data.name,
        icon: data.icon,
        color: data.color,
        isConfigured: false,
        type: 'custom',
      };

      this.contactCards = [...this.contactCards, newCard];
      await this.showToast('New contact type added');
    }
  }
}
