import { Component, OnInit } from '@angular/core';
import { IonicModule, ModalController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface IconOption {
  name: string;
  icon: string;
}

interface ColorOption {
  name: string;
  value: string;
}

@Component({
  selector: 'app-custom-contact-type-modal',
  templateUrl: './custom-contact-type-modal.component.html',
  styleUrls: ['./custom-contact-type-modal.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
})
export class CustomContactTypeModalComponent implements OnInit {
  customTypeName: string = '';
  selectedIcon: string = '';
  selectedColor: string = '';

  iconOptions: IconOption[] = [
    { name: 'Phone', icon: 'call-outline' },
    { name: 'Email', icon: 'mail-outline' },
    { name: 'LinkedIn', icon: 'logo-linkedin' },
    { name: 'Twitter', icon: 'logo-twitter' },
    { name: 'GitHub', icon: 'logo-github' },
    { name: 'Telegram', icon: 'logo-telegram' },
    { name: 'WhatsApp', icon: 'logo-whatsapp' },
    { name: 'Discord', icon: 'logo-discord' },
  ];

  colorOptions: ColorOption[] = [
    { name: 'Blue', value: '#4a9eff' },
    { name: 'Green', value: '#4caf50' },
    { name: 'Red', value: '#f44336' },
    { name: 'Yellow', value: '#ffc107' },
    { name: 'Purple', value: '#9c27b0' },
    { name: 'Cyan', value: '#00bcd4' },
    { name: 'Dark', value: '#333333' },
    { name: 'Custom', value: '#ffffff' },
  ];

  constructor(private modalCtrl: ModalController) {}

  ngOnInit() {
    // Initialize with default selections
    this.selectedIcon = this.iconOptions[0].icon;
    this.selectedColor = this.colorOptions[0].value;
  }

  selectIcon(icon: string) {
    this.selectedIcon = icon;
  }

  selectColor(color: string) {
    this.selectedColor = color;
  }

  async createType() {
    if (!this.customTypeName.trim()) {
      // Show error toast or validation message
      return;
    }

    const result = {
      name: this.customTypeName,
      icon: this.selectedIcon,
      color: this.selectedColor,
    };

    await this.modalCtrl.dismiss(result);
  }

  cancel() {
    this.modalCtrl.dismiss();
  }
}
