import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import type { UserRole } from '../models';

export interface AuthUser {
  name: string;
  role: UserRole;
  org?: string;
  uid: string;
  avatarText: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private user$ = new BehaviorSubject<AuthUser | null>(null);

  get user(): Observable<AuthUser | null> {
    return this.user$.asObservable();
  }
  get snapshot(): AuthUser | null {
    return this.user$.getValue();
  }

  login(user: AuthUser) {
    this.user$.next(user);
  }
  logout() {
    this.user$.next(null);
  }
  hasRole(...roles: UserRole[]) {
    const u = this.snapshot;
    return !!u && roles.includes(u.role);
  }
}