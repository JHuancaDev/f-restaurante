import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageModule } from 'primeng/message';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { OrderM, OrderService } from '../../service/order-service';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { OrderDetailExtras } from "../order-detail-extras/order-detail-extras";

@Component({
  selector: 'app-order-detail',
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    ButtonModule,
    TagModule,
    TableModule,
    ProgressSpinnerModule,
    ConfirmDialogModule,
    ToastModule,
    MessageModule,
    RouterModule,
    CommonModule,
    FormsModule,
    OrderDetailExtras
  ],
  templateUrl: './order-detail.html',
  styleUrl: './order-detail.scss',
})
export class OrderDetail implements OnInit {
  order: OrderM | null = null;
  loading = false;
  error: string | null = null;
  orderId!: number;
  extrasTotal: number = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private orderService: OrderService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private cdr: ChangeDetectorRef
  ) { }


  onExtrasUpdated(total: number): void {
    this.extrasTotal = total;
    this.cdr.detectChanges();
  }

  getFinalTotal(): number {
    return (this.order?.total_amount || 0) + this.extrasTotal;
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.orderId = +params['id'];
      if (this.orderId) {
        this.loadOrderDetails();
      }
    });

    // 🔥 AGREGAR: Escuchar actualizaciones de extras
    window.addEventListener('orderUpdated', (event: any) => {
      if (event.detail.id === this.orderId) {
        console.log('🔄 Esta orden fue actualizada con extras:', event.detail);

        // Si la orden actualizada es la que estamos viendo
        if (this.order && event.detail.id === this.order.id) {
          // Actualizar el total y los extras
          this.order.total_amount = event.detail.total_amount;
          if (event.detail.extras) {
            // Aquí podrías actualizar la lista de extras si tienes una
            this.extrasTotal = event.detail.extras.reduce((total: number, extra: any) =>
              total + extra.subtotal, 0);
          }
          this.cdr.detectChanges();

          // Mostrar mensaje de confirmación
          this.messageService.add({
            severity: 'success',
            summary: 'Extras Agregados',
            detail: 'Se han agregado extras a la orden',
            life: 3000
          });
        }
      }
    });

    this.cdr.detectChanges();
  }

  loadOrderDetails(): void {
    this.loading = true;
    this.error = null;

    this.orderService.getOrderById(this.orderId).subscribe({
      next: (order) => {
        this.order = order;
        this.loading = false;
        console.log('✅ Detalles del pedido cargados:', order);
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.error = 'No se pudo cargar el pedido: ' + error.message;
        this.loading = false;
        console.error('❌ Error cargando pedido:', error);
        this.cdr.detectChanges();
      }
    });
  }

  // 🔥 AGREGAR EN ngOnDestroy
  ngOnDestroy(): void {
    window.removeEventListener('orderUpdated', () => { });
  }

  getOrderTypeLabel(type: string): string {
    return type === 'dine_in' ? 'En Restaurante' : 'Delivery';
  }

  getStatusSeverity(status: string): string {
    const severityMap: { [key: string]: string } = {
      'recibido': 'warn',
      'en_preparacion': 'info',
      'listo': 'success',
      'entregado': 'help',
      'completado': 'success'
    };
    return severityMap[status] || 'secondary';
  }

  isStatusActive(status: string): boolean {
    if (!this.order) return false;

    const statusOrder = ['recibido', 'en_preparacion', 'listo', 'entregado', 'completado'];
    const currentIndex = statusOrder.indexOf(this.order.status);
    const targetIndex = statusOrder.indexOf(status);

    return targetIndex <= currentIndex;
  }

  canUpdateStatus(): boolean {
    if (!this.order) return false;
    return this.order.status !== 'completado';
  }

  getNextStatusLabel(currentStatus: string): string {
    const nextStatusMap: { [key: string]: string } = {
      'recibido': 'En Preparación',
      'en_preparacion': 'Listo',
      'listo': 'Entregado',
      'entregado': 'Completado'
    };
    return nextStatusMap[currentStatus] || 'Siguiente Estado';
  }

  getNextStatus(currentStatus: string): string {
    const statusFlow: { [key: string]: string } = {
      'recibido': 'en_preparacion',
      'en_preparacion': 'listo',
      'listo': 'entregado',
      'entregado': 'completado'
    };
    return statusFlow[currentStatus] || 'recibido';
  }

  updateStatus(): void {
    if (!this.order || !this.canUpdateStatus()) return;

    const nextStatus = this.getNextStatus(this.order.status);

    this.confirmationService.confirm({
      message: `¿Está seguro de cambiar el estado del pedido #${this.order.id} a "${nextStatus}"?`,
      header: 'Confirmar Cambio de Estado',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, cambiar',
      rejectLabel: 'Cancelar',
      accept: () => {
        this.orderService.updateOrderStatus(this.orderId, nextStatus).subscribe({
          next: (updatedOrder) => {
            this.order = updatedOrder;
            this.messageService.add({
              severity: 'success',
              summary: 'Éxito',
              detail: `Estado actualizado a "${nextStatus}"`
            });
          },
          error: (error) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'No se pudo actualizar el estado: ' + error.message
            });
          }
        });
      }
    });
  }

  markAsPaid(): void {
    if (!this.order || this.order.is_paid) return;

    this.confirmationService.confirm({
      message: `¿Marcar el pedido #${this.order.id} como pagado?`,
      header: 'Confirmar Pago',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, marcar como pagado',
      rejectLabel: 'Cancelar',
      accept: () => {
        // Aquí deberías implementar la lógica para marcar como pagado
        // Por ahora, solo simulamos
        this.order!.is_paid = true;
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Pedido marcado como pagado'
        });
      }
    });
  }

  editOrder(): void {
    // Aquí podrías navegar a un formulario de edición
    this.messageService.add({
      severity: 'info',
      summary: 'Información',
      detail: 'Función de edición en desarrollo'
    });
  }

  deleteOrder(): void {
    if (!this.order) return;

    this.confirmationService.confirm({
      message: `¿Está seguro de eliminar el pedido #${this.order.id}? Esta acción no se puede deshacer.`,
      header: 'Confirmar Eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, eliminar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        // Aquí deberías implementar la eliminación
        // Por ahora, solo navegamos de vuelta
        this.router.navigate(['/orders']);
        this.messageService.add({
          severity: 'success',
          summary: 'Eliminado',
          detail: `Pedido #${this.order?.id} eliminado`
        });
      }
    });
  }
}
