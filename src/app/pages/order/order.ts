import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { OrderService, OrderM, OrderItem } from '../../service/order-service';
import { NotificationService } from '../../service/notification-service';
import { WebsocketService } from '../../service/websocket-service';
import { Subscription } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { RouterModule } from '@angular/router';
import { TagModule } from 'primeng/tag';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BadgeModule } from 'primeng/badge';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';

type OrderStatus = 'recibido' | 'en_preparacion' | 'listo' | 'entregado' | 'completado';

interface StatusFlow {
  [key: string]: OrderStatus;
}

@Component({
  selector: 'app-order',
  imports: [
    ButtonModule,
    RouterModule,
    TagModule,
    CommonModule,
    FormsModule,
    BadgeModule,
    CardModule,
    TableModule,

  ],
  templateUrl: './order.html',
  styleUrl: './order.scss',
})

export class Order implements OnInit, OnDestroy {
  orders: OrderM[] = []; // ✅ Usar Order del servicio
  loading = false;
  private notificationSubscription: Subscription;

  // 🔥 AGREGAR: Variables para seguimiento de actualizaciones
  private updatedOrders = new Set<number>(); // IDs de órdenes actualizadas
  private updateTimeouts = new Map<number, any>(); // Para limpiar timeouts


   // 🔥 AGREGAR: Propiedades computadas
  get ordersWithExtras(): OrderM[] {
    return this.orders.filter(order => 
      order.extras && order.extras.length > 0
    );
  }

  get ordersWithExtrasCount(): number {
    return this.ordersWithExtras.length;
  }

  get hasOrdersWithExtras(): boolean {
    return this.ordersWithExtrasCount > 0;
  }

  
  constructor(
    private orderService: OrderService,
    private notificationService: NotificationService,
    public websocketService: WebsocketService,
    private cdr: ChangeDetectorRef
  ) {
    this.notificationSubscription = this.websocketService.notifications$.subscribe(
      notification => {
        console.log('📨 Notificación WebSocket recibida en componente:', notification);
        if (notification.type === 'new_order') {
          this.handleNewOrder(notification.data);
        } else if (notification.type === 'order_updated') {
          // 🔥 MODIFICADO: Manejar órdenes actualizadas
          this.handleOrderUpdated(notification.data);
        }
      }
    );
  }

  ngOnInit(): void {
    this.loadOrders();
    this.notificationService.requestNotificationPermission();

    // Escuchar nuevas órdenes
    window.addEventListener('newOrderReceived', (event: any) => {
      this.handleNewOrder(event.detail);
    });

    // 🔥 AGREGAR: Escuchar órdenes actualizadas
    window.addEventListener('orderUpdated', (event: any) => {
      this.handleOrderUpdated(event.detail);
    });
  }

  ngOnDestroy(): void {
    this.notificationSubscription?.unsubscribe();
    window.removeEventListener('newOrderReceived', () => { });

    // 🔥 AGREGAR: Limpiar todos los timeouts
    this.updateTimeouts.forEach(timeout => clearTimeout(timeout));
    this.updateTimeouts.clear();
  }

  // app/pages/order/order.ts - AGREGAR MÉTODOS NUEVOS
  // 🔥 AGREGAR: Calcular total de extras
  calculateExtrasTotal(extras: any[]): number {
    return extras?.reduce((total, extra) => total + extra.subtotal, 0) || 0;
  }

  // 🔥 AGREGAR: Filtrar órdenes con extras
   filterOrdersWithExtras(): void {
    // Puedes implementar lógica de filtrado aquí
    // Por ejemplo, resaltar o mostrar solo órdenes con extras
    this.ordersWithExtras.forEach(order => {
      this.markOrderAsUpdated(order.id);
    });
    
    this.cdr.detectChanges();
    
    // Opcional: Mostrar mensaje
    console.log(`Mostrando ${this.ordersWithExtrasCount} órdenes con extras`);
  }

  // 🔥 AGREGAR: Obtener texto descriptivo de extras
  getExtrasDescription(extras: any[]): string {
    if (!extras || extras.length === 0) return '';

    if (extras.length === 1) {
      return `+1 extra: ${extras[0].extra_name}`;
    }

    const firstExtra = extras[0].extra_name;
    return `+${extras.length} extras: ${firstExtra} y ${extras.length - 1} más`;
  }

  // 🔥 AGREGAR: Método para manejar órdenes actualizadas
  // 🔥 MODIFICADO: Método para manejar órdenes actualizadas
  handleOrderUpdated(updatedOrder: any): void {
    console.log('🔄 Orden actualizada recibida en componente:', updatedOrder);

    const existingOrderIndex = this.orders.findIndex(order => order.id === updatedOrder.id);

    if (existingOrderIndex !== -1) {
      // Marcar como actualizada
      this.markOrderAsUpdated(updatedOrder.id);

      // Actualizar datos de la orden
      this.orders[existingOrderIndex] = {
        ...this.orders[existingOrderIndex],
        ...updatedOrder,
        // Asegurar que los extras se actualicen
        extras: updatedOrder.extras || this.orders[existingOrderIndex].extras,
        total_amount: updatedOrder.total_amount
      };

      this.cdr.detectChanges();
      console.log('✅ Orden actualizada en la lista');

      // 🔥 AGREGAR: Mostrar notificación visual
      this.showUpdateNotification(updatedOrder);
    }
  }

  // 🔥 AGREGAR: Método para marcar orden como actualizada
  private markOrderAsUpdated(orderId: number): void {
    this.updatedOrders.add(orderId);

    // Limpiar timeout anterior si existe
    if (this.updateTimeouts.has(orderId)) {
      clearTimeout(this.updateTimeouts.get(orderId));
    }

    // Remover después de 30 segundos
    const timeout = setTimeout(() => {
      this.updatedOrders.delete(orderId);
      this.cdr.detectChanges();
      this.updateTimeouts.delete(orderId);
    }, 30000);

    this.updateTimeouts.set(orderId, timeout);
  }

  // 🔥 AGREGAR: Método para verificar si una orden fue actualizada
  isOrderUpdated(orderId: number): boolean {
    return this.updatedOrders.has(orderId);
  }

  // 🔥 AGREGAR: Mostrar notificación visual
  private showUpdateNotification(orderData: any): void {
    // Crear notificación temporal en la UI
    const notificationDiv = document.createElement('div');
    notificationDiv.className = 'update-notification';
    notificationDiv.innerHTML = `
      <div class="update-notification-content">
        <i class="pi pi-shopping-cart"></i>
        <div>
          <strong>Orden #${orderData.id} actualizada</strong>
          <small>${orderData.user_name} agregó extras - Nuevo total: $${orderData.total_amount.toFixed(2)}</small>
        </div>
      </div>
    `;

    document.body.appendChild(notificationDiv);

    // Remover después de 5 segundos
    setTimeout(() => {
      notificationDiv.classList.add('fade-out');
      setTimeout(() => {
        if (document.body.contains(notificationDiv)) {
          document.body.removeChild(notificationDiv);
        }
      }, 500);
    }, 5000);
  }

  // 🔥 AGREGAR: Método para resaltar órdenes actualizadas
  private highlightUpdatedOrder(orderId: number): void {
    setTimeout(() => {
      const element = document.getElementById(`order-${orderId}`);
      if (element) {
        element.classList.add('updated-order-highlight');
        setTimeout(() => {
          element.classList.remove('updated-order-highlight');
        }, 5000);
      }
    }, 100);
  }

  loadOrders(): void {
    this.loading = true;
    this.orderService.getAllOrders().subscribe({
      next: (orders) => {
        this.orders = orders;
        this.loading = false;
        this.cdr.detectChanges();
        console.log('✅ Órdenes cargadas:', this.orders.length);
      },
      error: (error) => {
        console.error('❌ Error cargando órdenes:', error);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  handleNewOrder(newOrder: any): void {
    console.log('🆕 Nueva orden recibida:', newOrder);

    const existingOrderIndex = this.orders.findIndex(order => order.id === newOrder.id);

    if (existingOrderIndex === -1) {
      // Convertir a tipo Order correctamente
      const completeOrder: OrderM = {
        id: newOrder.id,
        user_name: newOrder.user_name || 'Cliente',
        order_type: newOrder.order_type || 'dine_in',
        table_id: newOrder.table_id,
        delivery_address: newOrder.delivery_address || '',
        special_instructions: newOrder.special_instructions || '',
        user_id: newOrder.user_id,
        status: newOrder.status || 'recibido',
        total_amount: newOrder.total_amount || 0,
        estimated_time: newOrder.estimated_time || 0,
        is_paid: newOrder.is_paid || false,
        created_at: newOrder.created_at || new Date().toISOString(),
        updated_at: newOrder.updated_at || null,
        items: newOrder.items || [],
        extras: newOrder.extras || [],
        table_number: newOrder.table_number,
        table_capacity: newOrder.table_capacity
      };

      this.orders = [completeOrder, ...this.orders];
      this.cdr.detectChanges();
      this.highlightNewOrder(newOrder.id);

      console.log('✅ Nueva orden agregada. Total:', this.orders.length);
    } else {
      console.log('⚠️ Orden ya existe, actualizando...');
      this.orders[existingOrderIndex] = newOrder;
      if (newOrder.extras && !this.orders[existingOrderIndex].extras) {
        this.orders[existingOrderIndex].extras = newOrder.extras;
      }
      this.cdr.detectChanges();
    }
  }

  private highlightNewOrder(orderId: number): void {
    setTimeout(() => {
      const element = document.getElementById(`order-${orderId}`);
      if (element) {
        element.classList.add('new-order-highlight');
        setTimeout(() => {
          element.classList.remove('new-order-highlight');
        }, 5000);
      }
    }, 100);
  }

  getStatusSeverity(status: string): string {
    const severityMap: { [key: string]: string } = {
      'recibido': 'warning', // ✅ CORREGIDO: 'warning' en lugar de 'warn'
      'en_preparacion': 'info',
      'listo': 'success',
      'entregado': 'help',
      'completado': 'success'
    };
    return severityMap[status] || 'secondary';
  }

  getOrderTypeLabel(type: string): string {
    return type === 'dine_in' ? 'En Restaurante' : 'Delivery';
  }

  calculateItemsCount(items: OrderItem[]): number {
    return items?.reduce((total, item) => total + item.quantity, 0) || 0;
  }

  updateOrderStatus(orderId: number, status: string): void {
    console.log(`🔄 Actualizando orden ${orderId} a estado: ${status}`);

    this.orderService.updateOrderStatus(orderId, status).subscribe({
      next: (updatedOrder) => {
        console.log('✅ Estado actualizado:', updatedOrder);
        const index = this.orders.findIndex(order => order.id === orderId);
        if (index !== -1) {
          this.orders[index] = updatedOrder;
          this.cdr.detectChanges();
        }
      },
      error: (error) => {
        console.error('❌ Error actualizando orden:', error);
      }
    });
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
}
