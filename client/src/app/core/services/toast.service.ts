import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BehaviorSubject } from 'rxjs';
import type { Notification } from '../models';
import { DataService } from './data.service';

@Injectable({ providedIn: 'root' })
export class ToastService {
  private notify$ = new BehaviorSubject<Notification[]>([]);
  private data = new DataService();
  constructor(private snack: MatSnackBar) {}

  show(message: string, kind: 'success' | 'error' | 'info' = 'success') {
    this.snack.open(message, 'Close', {
      duration: 3200,
      panelClass: ['toast', `toast-${kind}`],
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
    });
  }

  loadNotifications(role: string) {
    this.data.getNotificationsFor(role).then((n) => this.notify$.next(n));
  }
  get notifications() {
    return this.notify$.asObservable();
  }
}