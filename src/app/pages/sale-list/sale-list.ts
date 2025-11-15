import { Component } from '@angular/core';
import { Sale } from '../../models/sale-m';
import { SaleService } from '../../service/sale-service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { CardModule } from 'primeng/card';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { TabsModule } from 'primeng/tabs';
import { ButtonModule } from 'primeng/button';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ConfirmPopupModule } from 'primeng/confirmpopup';
import { TagModule } from 'primeng/tag';
import { PanelModule } from 'primeng/panel';

@Component({
  selector: 'app-sale-list',
  imports: [
    ToastModule,
    CardModule,
    CommonModule,
    TableModule,
    TabsModule,
    ButtonModule,
    RouterModule,
    FormsModule,
    ConfirmPopupModule,
    TagModule,
    PanelModule,

  ],
  templateUrl: './sale-list.html',
  styleUrl: './sale-list.scss',
})
export class SaleList {
  sales: Sale[] = [];
  mySales: Sale[] = [];
  loading: boolean = false;
  activeTab: number = 0;

  // Estadísticas
  totalSales: number = 0;
  totalRevenue: number = 0;
  averageSale: number = 0;

  constructor(
    private saleService: SaleService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
  ) { }

  ngOnInit(): void {
    this.loadAllSales();
    this.loadMySales();
  }

  loadAllSales(): void {
    this.loading = true;
    this.saleService.getSales().subscribe({
      next: (sales) => {
        this.sales = sales;
        this.calculateStatistics(sales);
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading sales:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al cargar las ventas'
        });
        this.loading = false;
      }
    });
  }

  loadMySales(): void {
    this.saleService.getMySales().subscribe({
      next: (sales) => {
        this.mySales = sales;
      },
      error: (error) => {
        console.error('Error loading my sales:', error);
      }
    });
  }

  calculateStatistics(sales: Sale[]): void {
    this.totalSales = sales.length;
    this.totalRevenue = sales.reduce((sum, sale) => sum + sale.total_amount, 0);
    this.averageSale = this.totalSales > 0 ? this.totalRevenue / this.totalSales : 0;
  }

  updateSaleStatus(sale: Sale, newStatus: string): void {
    this.confirmationService.confirm({
      message: `¿Cambiar estado de la venta #${sale.id} a "${newStatus}"?`,
      header: 'Confirmar Cambio de Estado',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí',
      rejectLabel: 'No',
      accept: () => {
        this.saleService.updateSaleStatus(sale.id, newStatus).subscribe({
          next: (updatedSale) => {
            // Actualizar en la lista
            const index = this.sales.findIndex(s => s.id === sale.id);
            if (index !== -1) {
              this.sales[index] = updatedSale;
            }

            const myIndex = this.mySales.findIndex(s => s.id === sale.id);
            if (myIndex !== -1) {
              this.mySales[myIndex] = updatedSale;
            }

            this.messageService.add({
              severity: 'success',
              summary: 'Éxito',
              detail: `Estado actualizado a "${newStatus}"`
            });
          },
          error: (error) => {
            console.error('Error updating sale status:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Error al actualizar el estado'
            });
          }
        });
      }
    });
  }

  getStatusSeverity(status: string): string {
    switch (status.toLowerCase()) {
      case 'completed': return 'success';
      case 'pending': return 'warn';
      case 'cancelled': return 'danger';
      case 'processing': return 'info';
      default: return 'secondary';
    }
  }

  getPaymentMethodIcon(method: string): string {
    switch (method.toLowerCase()) {
      case 'cash': return 'pi pi-money-bill';
      case 'card': return 'pi pi-credit-card';
      case 'transfer': return 'pi pi-send';
      default: return 'pi pi-dollar';
    }
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  onTabChange(event: any): void {
    this.activeTab = event.index;
  }
}
