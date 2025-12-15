import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
// PrimeNG Imports
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DataViewModule } from 'primeng/dataview';
import { TagModule } from 'primeng/tag';
import { DialogModule } from 'primeng/dialog';
import { TextareaModule } from 'primeng/textarea';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToolbarModule } from 'primeng/toolbar';
import { SkeletonModule } from 'primeng/skeleton';
import { MessageService, ConfirmationService } from 'primeng/api';

import { CategoryWithCount, CategoryCreate, CategoryM, CategoryUpdate } from '../../models/categoryM';
import { CategoryService } from '../../service/category-service';
import { TableModule } from 'primeng/table';
import { ImageModule } from 'primeng/image';
import { FileUploadModule } from 'primeng/fileupload';
import { ToggleSwitchModule } from 'primeng/toggleswitch';



@Component({
  selector: 'app-category',
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    ButtonModule,
    InputTextModule,
    DataViewModule,
    TagModule,
    DialogModule,
    TextareaModule,
    ToastModule,
    ConfirmDialogModule,
    ToolbarModule,
    SkeletonModule,
    TableModule,
    ImageModule,
    FileUploadModule,
  ],
  templateUrl: './category.html',
  styleUrl: './category.scss'
})
export class Category implements OnInit {


  categories: CategoryWithCount[] = [];
  loading = false;

  // Dialog
  displayDialog = false;
  isEditMode = false;
  dialogTitle = 'Nueva Categoría';

  // Image handling
  selectedImageFile?: File;
  imagePreview?: string;
  imageSizeLimitMB = 5;
  acceptedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

  // Form
  categoryForm: CategoryCreate = {
    name: '',
    description: '',
    url_image: ''
  };

  selectedCategoryId?: number;

  // Search
  searchTerm = '';

  // Pagination
  first = 0;
  rows = 10;

  // Referencia al input file
  @ViewChild('fileInput') fileInput?: ElementRef;

  constructor(
    private categoryService: CategoryService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.cdr.detectChanges();
    this.loadCategories();
    this.cdr.detectChanges();
  }

   getCategoryImage(category: any): string | undefined {
    // Primero intentar con url_image directo
    if (category.url_image) {
      return category.url_image;
    }
    
    // Si no existe, intentar obtener de otra propiedad
    // (dependiendo de cómo lleguen los datos)
    return category.image_url || category.image || undefined;
  }

   handleImageError(category: any): void {
    console.warn(`Error cargando imagen para categoría ${category.name}`);
    // Puedes limpiar la URL si hay error
    if (category.url_image) {
      category.url_image = undefined;
    }
    this.cdr.detectChanges();
  }

  loadCategories(): void {
    this.loading = true;
    this.categoryService.getCategoriesWithCounts()
      .subscribe({
        next: (data) => {
          this.categories = data;
          this.loading = false;
          this.cdr.detectChanges();
        },
        error: (error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudieron cargar las categorías: ' + error.message
          });
          this.loading = false;
          this.cdr.detectChanges();
        }
        
      });
  }

  openNewDialog(): void {
    this.isEditMode = false;
    this.dialogTitle = 'Nueva Categoría';
    this.categoryForm = {
      name: '',
      description: '',
      url_image: ''
    };
    this.selectedImageFile = undefined;
    this.imagePreview = undefined;
    this.displayDialog = true;
  }

  openEditDialog(category: CategoryM): void {
    this.isEditMode = true;
    this.dialogTitle = 'Editar Categoría';
    this.selectedCategoryId = category.id;
    this.categoryForm = {
      name: category.name,
      description: category.description,
      url_image: category.url_image || ''
    };
    this.selectedImageFile = undefined;
    this.imagePreview = category.url_image;
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
    this.categoryForm.url_image = '';
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
    this.categoryForm.url_image = '';
    this.imagePreview = undefined;
    this.cdr.detectChanges();
  }

  saveCategory(): void {
    if (!this.validateForm()) {
      return;
    }

    this.loading = true;

    if (this.isEditMode && this.selectedCategoryId) {
      // Actualizar categoría
      const updateData: CategoryUpdate = {
        name: this.categoryForm.name,
        description: this.categoryForm.description
      };

      if (this.selectedImageFile) {
        // Si hay nueva imagen, subirla
        this.categoryService.updateCategoryWithImage(
          this.selectedCategoryId, 
          updateData, 
          this.selectedImageFile
        ).subscribe({
          next: () => {
            this.handleSuccess('Categoría actualizada correctamente');
          },
          error: (error) => {
            this.handleError('No se pudo actualizar: ', error);
          }
        });
      } else if (this.categoryForm.url_image) {
        // Si hay URL de imagen, actualizar con URL
        updateData.url_image = this.categoryForm.url_image;
        this.categoryService.updateCategory(this.selectedCategoryId, updateData)
          .subscribe({
            next: () => {
              this.handleSuccess('Categoría actualizada correctamente');
            },
            error: (error) => {
              this.handleError('No se pudo actualizar: ', error);
            }
          });
      } else {
        // Si no hay imagen, actualizar solo datos
        this.categoryService.updateCategory(this.selectedCategoryId, updateData)
          .subscribe({
            next: () => {
              this.handleSuccess('Categoría actualizada correctamente');
            },
            error: (error) => {
              this.handleError('No se pudo actualizar: ', error);
            }
          });
      }
    } else {
      // Crear nueva categoría
      if (this.selectedImageFile) {
        // Con imagen
        this.categoryService.createCategoryWithImage(this.categoryForm, this.selectedImageFile)
          .subscribe({
            next: () => {
              this.handleSuccess('Categoría creada correctamente');
            },
            error: (error) => {
              this.handleError('No se pudo crear: ', error);
            }
          });
      } else if (this.categoryForm.url_image) {
        // Con URL
        this.categoryService.createCategory(this.categoryForm)
          .subscribe({
            next: () => {
              this.handleSuccess('Categoría creada correctamente');
            },
            error: (error) => {
              this.handleError('No se pudo crear: ', error);
            }
          });
      } else {
        // Sin imagen
        this.categoryService.createCategory(this.categoryForm)
          .subscribe({
            next: () => {
              this.handleSuccess('Categoría creada correctamente (sin imagen)');
            },
            error: (error) => {
              this.handleError('No se pudo crear: ', error);
            }
          });
      }
    }
  }

  private handleSuccess(message: string): void {
    this.messageService.add({
      severity: 'success',
      summary: 'Éxito',
      detail: message
    });
    this.displayDialog = false;
    this.loadCategories();
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

  deleteCategory(category: CategoryM): void {
    this.confirmationService.confirm({
      message: `¿Está seguro de eliminar la categoría "${category.name}"?`,
      header: 'Confirmar Eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, eliminar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        if (category.id) {
          this.categoryService.deleteCategory(category.id)
            .subscribe({
              next: () => {
                this.messageService.add({
                  severity: 'success',
                  summary: 'Eliminado',
                  detail: 'Categoría eliminada correctamente'
                });
                this.loadCategories();
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

  searchCategories(): void {
    if (this.searchTerm.trim()) {
      this.loading = true;
      this.categoryService.searchCategories(this.searchTerm)
        .subscribe({
          next: (data) => {
            this.categories = data as CategoryWithCount[];
            this.loading = false;
            this.cdr.detectChanges();
          },
          error: (error) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Error en la búsqueda: ' + error.message
            });
            this.loading = false;
            this.cdr.detectChanges();
          }
        });
    } else {
      this.loadCategories();
    }
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.loadCategories();
    this.cdr.detectChanges();
  }

  validateForm(): boolean {
    if (!this.categoryForm.name.trim()) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Validación',
        detail: 'El nombre es requerido'
      });
      return false;
    }

    if (!this.categoryForm.description.trim()) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Validación',
        detail: 'La descripción es requerida'
      });
      return false;
    }

    // La imagen ya no es requerida
    return true;
  }

  hideDialog(): void {
    this.displayDialog = false;
    this.clearFileInput();
  }
}
