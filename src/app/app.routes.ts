import { Routes } from '@angular/router';
import { QRCodeComponent } from './qrcode/qrcode.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: 'home',
    loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
  },
  {
    path: 'qrcode',
    component: QRCodeComponent,
  },
];
