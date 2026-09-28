import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import type { LocationInfo } from '../models';
import { DataService } from './data.service';

@Injectable({ providedIn: 'root' })
export class LocationService {
  private loc$ = new BehaviorSubject<LocationInfo>({ ...new DataService().defaultLocation });
  private data = inject(DataService);

  get location(): Observable<LocationInfo> {
    return this.loc$.asObservable();
  }
  snapshot(): LocationInfo {
    return this.loc$.getValue();
  }
  setLocation(loc: LocationInfo) {
    this.loc$.next(loc);
  }
  get shopsNear() {
    return this.data.getShops().then((shops) => {
      const l = this.snapshot();
      return shops.filter(
        (s) => s.status === 'active' && (s.city === l.city || s.area === l.area),
      );
    });
  }
}