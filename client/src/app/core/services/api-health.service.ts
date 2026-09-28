import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map, timeout } from 'rxjs/operators';

import { environment } from '../../../environments/environment';

export type ApiStatus = 'checking' | 'online' | 'offline';

export interface ApiHealth {
  status: ApiStatus;
  baseUrl: string;
  detail?: string;
}

/**
 * Probes the deployed ASP.NET Core API so the client can report whether the
 * backend is reachable. This is a liveness check only and needs no
 * authentication or database access.
 */
@Injectable({ providedIn: 'root' })
export class ApiHealthService {
  private http = inject(HttpClient);
  readonly baseUrl = environment.apiBaseUrl;

  check(): Observable<ApiHealth> {
    return this.http.get(`${this.baseUrl}/health`, { responseType: 'json' }).pipe(
      timeout(15000),
      map(() => ({ status: 'online' as ApiStatus, baseUrl: this.baseUrl })),
      catchError((err) =>
        of({
          status: 'offline' as ApiStatus,
          baseUrl: this.baseUrl,
          detail: err?.status === 0 ? 'unreachable or blocked by CORS' : `HTTP ${err?.status ?? 'error'}`,
        }),
      ),
    );
  }
}
