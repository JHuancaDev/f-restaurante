import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, FormsModule, Validators } from '@angular/forms';
import { ProductM } from '../../models/product-m';
import { SaleService } from '../../service/sale-service';
import { ProductService } from '../../service/product-service';
import { MessageService } from 'primeng/api';
import { Router } from '@angular/router';
import { CreateSaleRequest } from '../../models/sale-m';
import { ToastModule } from 'primeng/toast';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-sale-form',
  imports: [
    ToastModule,
    FormsModule,
    CommonModule,
    CardModule,


  ],
  templateUrl: './sale-form.html',
  styleUrl: './sale-form.scss',
})
export class SaleForm implements OnInit {
  saleForm: FormGroup;
  products: ProductM[] = [];
  loading: boolean = false;
  paymentMethods = [
    { label: 'Efectivo', value: 'cash' },
    { label: 'Tarjeta', value: 'card' },
    { label: 'Transferencia', value: 'transfer' }
  ];

  constructor(
    private fb: FormBuilder,
    private saleService: SaleService,
    private productService: ProductService,
    private messageService: MessageService,
    private router: Router
  ) {
    this.saleForm = this.createForm();
  }

  ngOnInit(): void {
    this.loadProducts();
    this.addItem(); // Agregar un item inicial
  }

  createForm(): FormGroup {
    return this.fb.group({
      payment_method: ['cash', Validators.required],
      notes: [''],
      items: this.fb.array([])
    });
  }

  get items(): FormArray {
    return this.saleForm.get('items') as FormArray;
  }

  createItem(): FormGroup {
    return this.fb.group({
      product_id: [null, Validators.required],
      quantity: [1, [Validators.required, Validators.min(1)]],
      unit_price: [0, [Validators.required, Validators.min(0)]]
    });
  }

  addItem(): void {
    this.items.push(this.createItem());
  }

  removeItem(index: number): void {
    this.items.removeAt(index);
  }

  loadProducts(): void {
    this.productService.getAvailableProducts().subscribe({
      next: (products) => {
        this.products = products;
      },
      error: (error) => {
        console.error('Error loading products:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al cargar los productos'
        });
      }
    });
  }

  onProductChange(index: number): void {
    const item = this.items.at(index);
    const productId = item.get('product_id')?.value;

    if (productId) {
      const product = this.products.find(p => p.id === productId);
      if (product) {
        item.get('unit_price')?.setValue(product.price);
      }
    }
  }

  calculateItemSubtotal(index: number): number {
    const item = this.items.at(index);
    const quantity = item.get('quantity')?.value || 0;
    const unitPrice = item.get('unit_price')?.value || 0;
    return quantity * unitPrice;
  }

  calculateTotal(): number {
    return this.items.controls.reduce((total, item, index) => {
      return total + this.calculateItemSubtotal(index);
    }, 0);
  }

  onSubmit(): void {
    if (this.saleForm.invalid || this.items.length === 0) {
      this.markFormGroupTouched();

      if (this.items.length === 0) {
        this.messageService.add({
          severity: 'warn',
          summary: 'Advertencia',
          detail: 'Debe agregar al menos un producto'
        });
      }

      return;
    }

    this.loading = true;
    const formValue: CreateSaleRequest = this.saleForm.value;

    this.saleService.createSale(formValue).subscribe({
      next: (sale) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: `Venta #${sale.id} creada correctamente`
        });
        this.router.navigate(['/sales']);
      },
      error: (error) => {
        console.error('Error creating sale:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al crear la venta'
        });
        this.loading = false;
      }
    });
  }

  markFormGroupTouched(): void {
    this.saleForm.markAllAsTouched();
  }

  // markFormGroupTouched(): void {
  //  Object.keys(this.saleForm.controls).forEach(key => {
  //   this.saleForm.get(key)?.markAsTouched();
  // });

  // this.items.controls.forEach(item => {
  //    Object.keys(item.controls).forEach(key => {
  //     item.get(key)?.markAsTouched();
  //    });
  //   });
  //  }

  onCancel(): void {
    this.router.navigate(['/sales']);
  }
}
