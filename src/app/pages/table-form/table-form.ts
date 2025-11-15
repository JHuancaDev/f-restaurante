import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TableService } from '../../service/table-service';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { CommonModule } from '@angular/common';
import { CheckboxModule } from 'primeng/checkbox';

@Component({
  selector: 'app-table-form',
  imports: [
    ButtonModule,
    ToastModule,
    CommonModule,
    CheckboxModule,
    FormsModule,
    ReactiveFormsModule,
    
  ],
  templateUrl: './table-form.html',
  styleUrl: './table-form.scss'
})
export class TableForm {
  tableForm: FormGroup;
  isEditMode: boolean = false;
  tableId?: number;
  loading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private tableService: TableService,
    private messageService: MessageService,
    
  ) {
    this.tableForm = this.createForm();
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.tableId = +params['id'];
        this.loadTableData();
      }
    });
  }

  createForm(): FormGroup {
    return this.fb.group({
      number: [null, [Validators.required, Validators.min(1)]],
      capacity: [null, [Validators.required, Validators.min(1)]],
      position_x: [null, [Validators.required, Validators.min(0)]],
      position_y: [null, [Validators.required, Validators.min(0)]],
      is_available: [true],
      is_active: [true]
    });
  }

  loadTableData(): void {
    if (!this.tableId) return;

    this.loading = true;
    this.tableService.getTableById(this.tableId).subscribe({
      next: (table) => {
        this.tableForm.patchValue(table);
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading table:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al cargar los datos de la mesa'
        });
        this.loading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.tableForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.loading = true;
    const formValue = this.tableForm.value;

    if (this.isEditMode && this.tableId) {
      this.tableService.updateTable(this.tableId, formValue).subscribe({
        next: (table) => {
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Mesa actualizada correctamente'
          });
          this.router.navigate(['/tables']);
        },
        error: (error) => {
          console.error('Error updating table:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Error al actualizar la mesa'
          });
          this.loading = false;
        }
      });
    } else {
      this.tableService.createTable(formValue).subscribe({
        next: (table) => {
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Mesa creada correctamente'
          });
          this.router.navigate(['/tables']);
        },
        error: (error) => {
          console.error('Error creating table:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Error al crear la mesa'
          });
          this.loading = false;
        }
      });
    }
  }

  markFormGroupTouched(): void {
    Object.keys(this.tableForm.controls).forEach(key => {
      this.tableForm.get(key)?.markAsTouched();
    });
  }

  onCancel(): void {
    this.router.navigate(['/tables']);
  }
}
