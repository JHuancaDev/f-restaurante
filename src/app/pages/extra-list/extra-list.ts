import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { ImageModule } from 'primeng/image';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { ToolbarModule } from 'primeng/toolbar';
import { ExtraCreate, ExtraFilters, ExtraM, ExtraUpdate } from '../../models/extra-m';
import { ExtraService } from '../../service/extra-service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ProgressSpinner, ProgressSpinnerModule } from 'primeng/progressspinner';

interface CategoryOption {
  label: string;
  value: string;
}

@Component({
  selector: 'app-extra-list',
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    ToastModule,
    ConfirmDialogModule,
    ToolbarModule,
    TableModule,
    ImageModule,
    TagModule,
    DialogModule,
    InputNumberModule,
    CardModule,
    ToggleSwitchModule,
    AutoCompleteModule,
    InputTextModule,
    InputTextModule,
    ProgressSpinnerModule
  ],
  templateUrl: './extra-list.html',
  styleUrl: './extra-list.scss',
})
export class ExtraList implements OnInit{
  extras: ExtraM[] = [];
  loading = false;
  imageUploading = false;

  // Dialog
  displayDialog = false;
  isEditMode = false;
  dialogTitle = 'Nuevo Extra';

  // Image handling
  selectedImageFile?: File;
  imagePreview?: string;
  imageSizeLimitMB = 5;
  acceptedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

  // Form
  extraForm: any = {
    name: '',
    description: null,
    price: 0,
    category: 'condimento',
    is_available: true,
    is_free: false,
    stock: 0,
    image_url: null
  };

  selectedExtraId?: number;

  // Categories
  categoryOptions: CategoryOption[] = [
    { label: 'Condimento', value: 'condimento' },
    { label: 'Aderezo', value: 'aderezo' },
    { label: 'Queso', value: 'queso' },
    { label: 'Salsa', value: 'salsa' },
    { label: 'Verdura', value: 'verdura' },
    { label: 'Proteína', value: 'proteina' },
    { label: 'Otro', value: 'otro' }
  ];

  // Filters
  selectedCategoryFilter?: string;
  availableOnlyFilter = true;
  freeOnlyFilter = false;

  // Pagination
  first = 0;
  rows = 10;

  @ViewChild('fileInput') fileInput?: ElementRef;

  constructor(
    private extraService: ExtraService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.loadExtras();
  }

  loadExtras(): void {
    this.loading = true;

    const filters: ExtraFilters = {
      category: this.selectedCategoryFilter,
      available_only: this.availableOnlyFilter,
      free_only: this.freeOnlyFilter
    };

    this.extraService.getExtras(filters).subscribe({
      next: (data) => {
        this.extras = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar los extras: ' + error.message
        });
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  applyFilters(): void {
    this.loadExtras();
  }

  clearFilters(): void {
    this.selectedCategoryFilter = undefined;
    this.availableOnlyFilter = true;
    this.freeOnlyFilter = false;
    this.loadExtras();
  }

  openNewDialog(): void {
    this.isEditMode = false;
    this.dialogTitle = 'Nuevo Extra';
    this.extraForm = {
      name: '',
      description: null,
      price: 0,
      category: 'condimento',
      is_available: true,
      is_free: false,
      stock: 0,
      image_url: null
    };
    this.selectedImageFile = undefined;
    this.imagePreview = undefined;
    this.displayDialog = true;
  }

  openEditDialog(extra: ExtraM): void {
    this.isEditMode = true;
    this.dialogTitle = 'Editar Extra';
    this.selectedExtraId = extra.id;
    this.extraForm = {
      name: extra.name,
      description: extra.description,
      price: extra.price,
      category: extra.category,
      is_available: extra.is_available,
      is_free: extra.is_free,
      stock: extra.stock,
      image_url: extra.image_url
    };
    this.selectedImageFile = undefined;
    this.imagePreview = extra.image_url || undefined;
    this.displayDialog = true;
  }

  onImageSelected(event: any): void {
    const file = event.target.files[0];

    if (!file) return;

    // Validar tipo de archivo
    if (!this.acceptedImageTypes.includes(file.type)) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Solo se permiten imágenes (JPEG, PNG, GIF, WebP)'
      });
      this.clearFileInput();
      return;
    }

    // Validar tamaño
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > this.imageSizeLimitMB) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: `La imagen no debe superar ${this.imageSizeLimitMB}MB`
      });
      this.clearFileInput();
      return;
    }

    this.selectedImageFile = file;

    // Crear preview
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.imagePreview = e.target.result;
      this.cdr.detectChanges();
    };
    reader.readAsDataURL(file);

    // Limpiar la URL si se subió un archivo
    this.extraForm.image_url = null;
  }

  clearFileInput(): void {
    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
    this.selectedImageFile = undefined;
    this.imagePreview = undefined;
  }

  removeImage(): void {
    this.clearFileInput();
    this.extraForm.image_url = null;
    this.imagePreview = undefined;
    this.cdr.detectChanges();
  }

  onFreeToggleChange(event: any): void {
    if (event.checked) {
      this.extraForm.price = 0;
    }
  }

  saveExtra(): void {
    if (!this.validateForm()) {
      return;
    }

    this.loading = true;

    if (this.isEditMode && this.selectedExtraId) {
      // Actualizar extra
      const updateData: ExtraUpdate = {
        name: this.extraForm.name,
        description: this.extraForm.description,
        price: this.extraForm.price,
        category: this.extraForm.category,
        is_available: this.extraForm.is_available,
        is_free: this.extraForm.is_free,
        stock: this.extraForm.stock,
        image_url: this.extraForm.image_url
      };

      this.extraService.updateExtra(this.selectedExtraId, updateData).subscribe({
        next: () => {
          this.handleSuccess('Extra actualizado correctamente');
        },
        error: (error) => {
          this.handleError('No se pudo actualizar: ', error);
        }
      });
    } else {
      // Crear nuevo extra
      const createData: ExtraCreate = {
        name: this.extraForm.name,
        description: this.extraForm.description,
        price: this.extraForm.price,
        category: this.extraForm.category,
        is_free: this.extraForm.is_free,
        stock: this.extraForm.stock,
        image_url: this.extraForm.image_url
      };

      this.extraService.createExtra(createData).subscribe({
        next: () => {
          this.handleSuccess('Extra creado correctamente');
        },
        error: (error) => {
          this.handleError('No se pudo crear: ', error);
        }
      });
    }
  }

  private handleSuccess(message: string): void {
    this.messageService.add({
      severity: 'success',
      summary: 'Éxito',
      detail: message
    });
    this.displayDialog = false;
    this.loadExtras();
    this.loading = false;
  }

  private handleError(message: string, error: any): void {
    this.messageService.add({
      severity: 'error',
      summary: 'Error',
      detail: message + error.message
    });
    this.loading = false;
  }

  deleteExtra(extra: ExtraM): void {
    this.confirmationService.confirm({
      message: `¿Está seguro de eliminar el extra "${extra.name}"?`,
      header: 'Confirmar Eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, eliminar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        if (extra.id) {
          this.extraService.deleteExtra(extra.id).subscribe({
            next: () => {
              this.messageService.add({
                severity: 'success',
                summary: 'Eliminado',
                detail: 'Extra eliminado correctamente'
              });
              this.loadExtras();
            },
            error: (error) => {
              this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: error.message
              });
            }
          });
        }
      }
    });
  }

  toggleAvailability(extra: ExtraM): void {
    const updateData: ExtraUpdate = {
      is_available: !extra.is_available
    };

    this.extraService.updateExtra(extra.id, updateData).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Actualizado',
          detail: `Extra ${extra.is_available ? 'desactivado' : 'activado'}`
        });
        // Recargar extras para actualizar el estado
        this.loadExtras();
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: error.message
        });
      }
    });
  }

  validateForm(): boolean {
    if (!this.extraForm.name.trim()) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Validación',
        detail: 'El nombre es requerido'
      });
      return false;
    }

    if (!this.extraForm.category) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Validación',
        detail: 'Seleccione una categoría'
      });
      return false;
    }

    if (this.extraForm.price < 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Validación',
        detail: 'El precio no puede ser negativo'
      });
      return false;
    }

    if (this.extraForm.stock < 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Validación',
        detail: 'El stock no puede ser negativo'
      });
      return false;
    }

    return true;
  }

  getCategoryLabel(category: string): string {
    const option = this.categoryOptions.find(c => c.value === category);
    return option ? option.label : category;
  }

  getCategorySeverity(category: string): string {
    const severityMap: { [key: string]: string } = {
      'condimento': 'success',
      'aderezo': 'info',
      'queso': 'warn',
      'salsa': 'danger',
      'verdura': 'help',
      'proteina': 'success',
      'otro': 'secondary'
    };
    return severityMap[category] || 'info';
  }

  getStockSeverity(stock: number): 'danger' | 'warning' | 'success' | undefined {
    if (stock === 0) return 'danger';
    if (stock < 10) return 'warning';
    return 'success';
  }

  hideDialog(): void {
    this.displayDialog = false;
    this.clearFileInput();
  }
}