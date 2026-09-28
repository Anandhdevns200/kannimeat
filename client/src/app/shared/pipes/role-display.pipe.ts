import { Pipe, PipeTransform } from '@angular/core';
import { roleLabel } from '../../core/services/data.service';

@Pipe({ name: 'roleDisplay', standalone: true })
export class RoleDisplayPipe implements PipeTransform {
  transform(role: string | null | undefined): string {
    return roleLabel[(role ?? '') as keyof typeof roleLabel] ?? role ?? '';
  }
}