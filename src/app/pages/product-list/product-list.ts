import { Component, forwardRef, OnInit } from '@angular/core';

import { CategoryOption, ProductCreate, ProductM } from '../../models/product-m';
import { ProductService } from '../../service/product-service';
import { CategoryService } from '../../service/category-service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { CategoryM } from '../../models/categoryM';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToolbarModule } from 'primeng/toolbar';
import { FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ImageModule } from 'primeng/image';
import { TagModule } from 'primeng/tag';
import { DialogModule } from 'primeng/dialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { SkeletonModule } from 'primeng/skeleton';
import { DataViewModule } from 'primeng/dataview';
import { BadgeModule } from 'primeng/badge';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { InputTextModule } from 'primeng/inputtext';


@Component({
  selector: 'app-product-list',
  imports: [
    ButtonModule,
    ToastModule,
    ConfirmDialogModule,
    ToolbarModule,
    FormsModule,
    TableModule,
    ImageModule,
    TagModule,
    DialogModule,
    InputNumberModule,
    CommonModule,
    CardModule,
    SkeletonModule,
    DataViewModule,
    BadgeModule,
    AutoCompleteModule,
    InputTextModule,
  ],
  templateUrl: './product-list.html',
  styleUrl: './product-list.scss',
})
export class ProductList implements OnInit {
  products: ProductM[] = [];
  categories: CategoryOption[] = [];
  loading = false;
  
  // Dialog
  displayDialog = false;
  displayStockDialog = false;
  isEditMode = false;
  dialogTitle = 'Nuevo Producto';
  
  // Form
  productForm: ProductCreate = {
    name: '',
    description: '',
    price: 0,
    category_id: 0,
    image_url: '',
    stock: 0
  };
  
  selectedProductId?: number;
  selectedProduct?: ProductM;
  
  // Stock management
  stockChange = 0;
  
  // Filters
  selectedCategoryFilter?: number;
  availableOnlyFilter = false;
  
  // Pagination
  first = 0;
  rows = 10;

  constructor(
    private productService: ProductService,
    private categoryService: CategoryService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit(): void {
    this.loadCategories();
    this.loadProducts();
  }

  loadCategories(): void {
    this.categoryService.getCategories().subscribe({
      next: (data) => {
        this.categories = data.map((cat: CategoryM) => ({
          label: cat.name,
          value: cat.id!
        }));
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar las categorías'
        });
      }
    });
  }

  loadProducts(): void {
    this.loading = true;
    const filters = {
      category_id: this.selectedCategoryFilter,
      available_only: this.availableOnlyFilter
    };
    
    this.productService.getProducts(filters).subscribe({
      next: (data) => {
        this.products = data;
        this.loading = false;
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar los productos: ' + error.message
        });
        this.loading = false;
      }
    });
  }

  applyFilters(): void {
    this.loadProducts();
  }

  clearFilters(): void {
    this.selectedCategoryFilter = undefined;
    this.availableOnlyFilter = false;
    this.loadProducts();
  }

  openNewDialog(): void {
    this.isEditMode = false;
    this.dialogTitle = 'Nuevo Producto';
    this.productForm = {
      name: '',
      description: '',
      price: 0,
      category_id: this.categories[0]?.value || 0,
      image_url: '',
      stock: 0
    };
    this.displayDialog = true;
  }

  openEditDialog(product: ProductM): void {
    this.isEditMode = true;
    this.dialogTitle = 'Editar Producto';
    this.selectedProductId = product.id;
    this.productForm = {
      name: product.name,
      description: product.description,
      price: product.price,
      category_id: product.category_id,
      image_url: product.image_url,
      stock: product.stock
    };
    this.displayDialog = true;
  }

  openStockDialog(product: ProductM): void {
    this.selectedProduct = product;
    this.stockChange = 0;
    this.displayStockDialog = true;
  }

  saveProduct(): void {
    if (!this.validateForm()) {
      return;
    }

    this.loading = true;

    if (this.isEditMode && this.selectedProductId) {
      // Actualizar
      const updateData = {
        ...this.productForm,
        is_available: this.productForm.stock > 0
      };
      
      this.productService.updateProduct(this.selectedProductId, updateData)
        .subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Éxito',
              detail: 'Producto actualizado correctamente'
            });
            this.displayDialog = false;
            this.loadProducts();
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
      this.productService.createProduct(this.productForm)
        .subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Éxito',
              detail: 'Producto creado correctamente'
            });
            this.displayDialog = false;
            this.loadProducts();
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

  updateStock(): void {
    if (!this.selectedProduct || this.stockChange === 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Validación',
        detail: 'Ingrese una cantidad válida'
      });
      return;
    }

    this.productService.updateStock(this.selectedProduct.id!, this.stockChange)
      .subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Stock actualizado correctamente'
          });
          this.displayStockDialog = false;
          this.loadProducts();
        },
        error: (error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo actualizar el stock: ' + error.message
          });
        }
      });
  }

  deleteProduct(product: ProductM): void {
    this.confirmationService.confirm({
      message: `¿Está seguro de eliminar el producto "${product.name}"?`,
      header: 'Confirmar Eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, eliminar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        if (product.id) {
          this.productService.deleteProduct(product.id)
            .subscribe({
              next: () => {
                this.messageService.add({
                  severity: 'success',
                  summary: 'Eliminado',
                  detail: 'Producto eliminado correctamente'
                });
                this.loadProducts();
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

  toggleAvailability(product: ProductM): void {
    const updateData = {
      is_available: !product.is_available
    };

    this.productService.updateProduct(product.id!, updateData)
      .subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Actualizado',
            detail: `Producto ${product.is_available ? 'desactivado' : 'activado'}`
          });
          this.loadProducts();
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
    if (!this.productForm.name.trim()) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Validación',
        detail: 'El nombre es requerido'
      });
      return false;
    }

    if (this.productForm.price <= 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Validación',
        detail: 'El precio debe ser mayor a 0'
      });
      return false;
    }

    if (!this.productForm.category_id) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Validación',
        detail: 'Seleccione una categoría'
      });
      return false;
    }

    if (this.productForm.stock < 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Validación',
        detail: 'El stock no puede ser negativo'
      });
      return false;
    }

    return true;
  }

  getCategoryName(categoryId: number): string {
    return this.categories.find(c => c.value === categoryId)?.label || 'Sin categoría';
  }

  getStockSeverity(stock: number): 'danger' | 'warning' | 'success' | undefined{
    if (stock === 0) return 'danger';
    if (stock < 10) return 'warning';
    return 'success';
  }

  hideDialog(): void {
    this.displayDialog = false;
  }

  hideStockDialog(): void {
    this.displayStockDialog = false;
  }
}
