import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CategoryOption, ProductCreate, ProductM, ProductUpdate } from '../../models/product-m';
import { ProductService } from '../../service/product-service';
import { CategoryService } from '../../service/category-service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToolbarModule } from 'primeng/toolbar';
import { FormsModule } from '@angular/forms';
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
import { ToggleSwitchModule } from 'primeng/toggleswitch';


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
    ToggleSwitchModule,
  ],
  templateUrl: './product-list.html',
  styleUrl: './product-list.scss',
})
export class ProductList implements OnInit {
  products: ProductM[] = [];
  categories: CategoryOption[] = [];
  loading = false;
  imageUploading = false;

  // Dialog
  displayDialog = false;
  displayStockDialog = false;
  isEditMode = false;
  dialogTitle = 'Nuevo Producto';

  // Image handling
  selectedImageFile?: File;
  imagePreview?: string;
  imageSizeLimitMB = 5; // 5MB límite
  acceptedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

  // Form
  productForm: ProductCreate = {
    name: '',
    description: '',
    price: 0,
    category_id: 0,
    stock: 0,
    image_url: ''
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

  // Nueva propiedad para búsqueda
  searchTerm = '';
  isSearching = false;
  searchTimeout: any;

  // Referencia al input file
  @ViewChild('fileInput') fileInput?: ElementRef;

  constructor(
    private productService: ProductService,
    private categoryService: CategoryService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.loadCategories();
    this.loadProducts();
  }

  onSearch(): void {
    if (this.searchTerm && this.searchTerm.trim().length >= 2) {
      this.isSearching = true;
      this.performSearch();
    } else if (!this.searchTerm.trim()) {
      this.clearSearch();
    }
  }

  performSearch(): void {
    this.loading = true;
    
    const searchParams = {
      q: this.searchTerm.trim(),
      category_id: this.selectedCategoryFilter,
      available_only: this.availableOnlyFilter,
      skip: this.first,
      limit: this.rows
    };

    this.productService.searchProducts(searchParams).subscribe({
      next: (data) => {
        this.products = data;
        this.loading = false;
        this.isSearching = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error en la búsqueda: ' + error.message
        });
        this.loading = false;
        this.isSearching = false;
        this.cdr.detectChanges();
      }
    });
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.isSearching = false;
    this.loadProducts(); // Vuelve a cargar todos los productos
    this.cdr.detectChanges();
  }

  loadCategories(): void {
    this.categoryService.getCategories().subscribe({
      next: (data) => {
        this.categories = data.map(cat => ({
          label: cat.name,
          value: cat.id!
        }));
        this.cdr.detectChanges();
      }
    });
  }

  loadProducts(): void {
    this.loading = true;
    const filters = {
      category_id: this.selectedCategoryFilter,
      available_only: this.availableOnlyFilter,
      skip: this.first,
      limit: this.rows
    };

    this.productService.getProducts(filters).subscribe({
      next: (data) => {
        this.products = data;
        this.loading = false;
        this.isSearching = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar los productos: ' + error.message
        });
        this.loading = false;
        this.isSearching = false;
        this.cdr.detectChanges();
      }
    });
  }

  onPageChange(event: any): void {
    this.first = event.first;
    this.rows = event.rows;
    
    if (this.isSearching && this.searchTerm.trim().length >= 2) {
      this.performSearch();
      this.cdr.detectChanges();
    } else {
      this.loadProducts();
      this.cdr.detectChanges();
    }
  }

  applyFilters(): void {
    if (this.isSearching && this.searchTerm.trim().length >= 2) {
      this.performSearch();
      this.cdr.detectChanges();
    } else {
      this.loadProducts();
      this.cdr.detectChanges();
    }
  }

  // Modificar clearFilters para incluir limpieza de búsqueda
  clearFilters(): void {
    this.selectedCategoryFilter = undefined;
    this.availableOnlyFilter = false;
    this.searchTerm = '';
    this.isSearching = false;
    this.loadProducts();
    this.cdr.detectChanges();
  }

  openNewDialog(): void {
    this.isEditMode = false;
    this.dialogTitle = 'Nuevo Producto';
    this.productForm = {
      name: '',
      description: '',
      price: 0,
      category_id: this.categories[0]?.value || 0,
      stock: 0,
      image_url: ''
    };
    this.selectedImageFile = undefined;
    this.imagePreview = undefined;
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
      stock: product.stock,
      image_url: product.image_url || ''
    };
    this.selectedImageFile = undefined;
    this.imagePreview = product.image_url;
    this.displayDialog = true;
    this.cdr.detectChanges();
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
      this.cdr.detectChanges();
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
    this.productForm.image_url = '';
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
    this.productForm.image_url = '';
    this.imagePreview = undefined;
    this.cdr.detectChanges();
  }

  saveProduct(): void {
    if (!this.validateForm()) {
      return;
    }

    this.loading = true;

    if (this.isEditMode && this.selectedProductId) {
      // Actualizar producto
      const updateData: ProductUpdate = {
        name: this.productForm.name,
        description: this.productForm.description,
        price: this.productForm.price,
        category_id: this.productForm.category_id,
        stock: this.productForm.stock
      };

      if (this.selectedImageFile) {
        // Si hay nueva imagen, subirla
        this.productService.updateProductWithImage(
          this.selectedProductId, 
          updateData, 
          this.selectedImageFile
        ).subscribe({
          next: () => {
            this.handleSuccess('Producto actualizado correctamente');
          },
          error: (error) => {
            this.handleError('No se pudo actualizar: ', error);
          }
        });
      } else if (this.productForm.image_url) {
        // Si hay URL de imagen, actualizar con URL
        updateData.image_url = this.productForm.image_url;
        this.productService.updateProduct(this.selectedProductId, updateData)
          .subscribe({
            next: () => {
              this.handleSuccess('Producto actualizado correctamente');
            },
            error: (error) => {
              this.handleError('No se pudo actualizar: ', error);
            }
          });
      } else {
        // Si no hay imagen, actualizar solo datos
        this.productService.updateProduct(this.selectedProductId, updateData)
          .subscribe({
            next: () => {
              this.handleSuccess('Producto actualizado correctamente');
            },
            error: (error) => {
              this.handleError('No se pudo actualizar: ', error);
            }
          });
      }
    } else {
      // Crear nuevo producto
      if (this.selectedImageFile) {
        // Con imagen
        this.productService.createProductWithImage(this.productForm, this.selectedImageFile)
          .subscribe({
            next: () => {
              this.handleSuccess('Producto creado correctamente');
            },
            error: (error) => {
              this.handleError('No se pudo crear: ', error);
            }
          });
      } else if (this.productForm.image_url) {
        // Con URL
        this.productService.createProduct(this.productForm)
          .subscribe({
            next: () => {
              this.handleSuccess('Producto creado correctamente');
            },
            error: (error) => {
              this.handleError('No se pudo crear: ', error);
            }
          });
      } else {
        // Sin imagen
        this.productService.createProduct(this.productForm)
          .subscribe({
            next: () => {
              this.handleSuccess('Producto creado correctamente (sin imagen)');
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
    this.loadProducts();
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

  openStockDialog(product: ProductM): void {
    this.selectedProduct = product;
    this.stockChange = 0;
    this.displayStockDialog = true;
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

  getStockSeverity(stock: number): 'danger' | 'warning' | 'success' | undefined {
    if (stock === 0) return 'danger';
    if (stock < 10) return 'warning';
    return 'success';
  }

  hideDialog(): void {
    this.displayDialog = false;
    this.clearFileInput();
  }

  hideStockDialog(): void {
    this.displayStockDialog = false;
  }
}
