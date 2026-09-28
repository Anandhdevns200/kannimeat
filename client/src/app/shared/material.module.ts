import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatBadgeModule } from '@angular/material/badge';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDialogModule } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatStepperModule } from '@angular/material/stepper';
import { MatRadioModule } from '@angular/material/radio';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCheckboxModule } from '@angular/material/checkbox';

const MODULES = [
  FormsModule, ReactiveFormsModule,
  MatButtonModule, MatIconModule, MatCardModule, MatToolbarModule, MatSidenavModule,
  MatListModule, MatMenuModule, MatFormFieldModule, MatInputModule, MatSelectModule,
  MatChipsModule, MatBadgeModule, MatProgressSpinnerModule, MatProgressBarModule,
  MatDialogModule, MatTableModule, MatTabsModule, MatTooltipModule, MatSnackBarModule,
  MatDividerModule, MatExpansionModule, MatStepperModule, MatRadioModule,
  MatAutocompleteModule, MatPaginatorModule, MatSlideToggleModule, MatButtonToggleModule,
  MatCheckboxModule,
];

@NgModule({
  imports: MODULES,
  exports: MODULES,
})
export class MaterialModule {}