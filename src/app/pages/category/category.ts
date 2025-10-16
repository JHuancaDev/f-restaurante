import { Component, OnInit } from '@angular/core';
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

import { CategoryWithCount, CategoryCreate, CategoryM } from '../../models/categoryM';
import { CategoryService } from '../../service/category-service';
import { TableModule } from 'primeng/table';
import { ImageModule } from 'primeng/image';



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
    ImageModule
  ],
  templateUrl: './category.html',
  styleUrl: './category.scss'
})
export class Category implements OnInit{


  categories: CategoryWithCount[] = [];
  loading = false;

  // Dialog
  displayDialog = false;
  isEditMode = false;
  dialogTitle = 'Nueva Categoría';

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

  constructor(
    private categoryService: CategoryService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    
  ) { }

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.loading = true;
    this.categoryService.getCategoriesWithCounts()
      .subscribe({
        next: (data) => {
          this.categories = data;
          this.loading = false;
        },
        error: (error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudieron cargar las categorías: ' + error.message
          });
          this.loading = false;
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
    this.displayDialog = true;
  }

  openEditDialog(category: CategoryM): void {
    this.isEditMode = true;
    this.dialogTitle = 'Editar Categoría';
    this.selectedCategoryId = category.id;
    this.categoryForm = {
      name: category.name,
      description: category.description,
      url_image: category.url_image
    };
    this.displayDialog = true;
  }

  saveCategory(): void {
    if (!this.validateForm()) {
      return;
    }

    this.loading = true;

    if (this.isEditMode && this.selectedCategoryId) {
      // Actualizar
      this.categoryService.updateCategory(this.selectedCategoryId, this.categoryForm)
        .subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Éxito',
              detail: 'Categoría actualizada correctamente'
            });
            this.displayDialog = false;
            this.loadCategories();
          },
          error: (error) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'No se pudo actualizar: ' + error.message
            });
            this.loading = false;
          }
        });
    } else {
      // Crear
      this.categoryService.createCategory(this.categoryForm)
        .subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Éxito',
              detail: 'Categoría creada correctamente'
            });
            this.displayDialog = false;
            this.loadCategories();
          },
          error: (error) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'No se pudo crear: ' + error.message
            });
            this.loading = false;
          }
        });
    }
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
          },
          error: (error) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Error en la búsqueda: ' + error.message
            });
            this.loading = false;
          }
        });
    } else {
      this.loadCategories();
    }
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.loadCategories();
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

    if (!this.categoryForm.url_image.trim()) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Validación',
        detail: 'La URL de la imagen es requerida'
      });
      return false;
    }

    return true;
  }

  hideDialog(): void {
    this.displayDialog = false;
  }
}
