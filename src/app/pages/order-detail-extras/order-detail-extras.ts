import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ExtraM, OrderExtraCreate, OrderExtraM } from '../../models/extra-m';
import { ExtraService } from '../../service/extra-service';
import { OrderService } from '../../service/order-service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { InputNumberModule } from 'primeng/inputnumber';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { CardModule } from 'primeng/card';
import { AutoCompleteModule } from 'primeng/autocomplete';

@Component({
  selector: 'app-order-detail-extras',
  imports: [
    CommonModule,
    FormsModule,
    DialogModule,
    ButtonModule,
    TableModule,
    TagModule,
    InputNumberModule,
    AutoCompleteModule,
    ToastModule,
    ConfirmDialogModule,
    CardModule
  ],
  templateUrl: './order-detail-extras.html',
  styleUrl: './order-detail-extras.scss',
})
export class OrderDetailExtras implements OnInit{
  @Input() orderId!: number;
  @Input() orderTotal: number = 0;
  @Output() extrasUpdated = new EventEmitter<number>();

  extras: OrderExtraM[] = [];
  availableExtras: ExtraM[] = [];
  selectedExtras: OrderExtraCreate[] = [];
  showAddDialog = false;
  loading = false;

  // Para selección
  selectedExtra: ExtraM | null = null;
  quantity: number = 1;

  constructor(
    private extraService: ExtraService,
    private orderService: OrderService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    if (this.orderId) {
      this.loadOrderExtras();
      this.loadAvailableExtras();
    }
  }

  loadOrderExtras(): void {
    this.loading = true;
    this.extraService.getOrderExtras(this.orderId).subscribe({
      next: (extras) => {
        this.extras = extras;
        this.loading = false;
        this.extrasUpdated.emit(this.calculateExtrasTotal());
      },
      error: (error) => {
        console.error('Error cargando extras:', error);
        this.loading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar los extras'
        });
      }
    });
  }

  loadAvailableExtras(): void {
    this.extraService.getAvailableExtras().subscribe({
      next: (extras) => {
        this.availableExtras = extras;
      },
      error: (error) => {
        console.error('Error cargando extras disponibles:', error);
      }
    });
  }

  calculateExtrasTotal(): number {
    return this.extras.reduce((total, extra) => total + extra.subtotal, 0);
  }

  getTotalWithExtras(): number {
    return this.orderTotal + this.calculateExtrasTotal();
  }

  openAddDialog(): void {
    this.selectedExtra = null;
    this.quantity = 1;
    this.showAddDialog = true;
  }

  addExtra(): void {
    if (!this.selectedExtra) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'Seleccione un extra'
      });
      return;
    }

    const extraToAdd: OrderExtraCreate = {
      extra_id: this.selectedExtra.id,
      quantity: this.quantity
    };

    this.loading = true;
    this.extraService.addExtrasToOrder(this.orderId, [extraToAdd]).subscribe({
      next: (addedExtras) => {
        this.extras = [...this.extras, ...addedExtras];
        this.showAddDialog = false;
        this.loading = false;
        
        // Emitir evento de actualización con sonido
        this.extrasUpdated.emit(this.calculateExtrasTotal());
        this.playUpdateSound();
        
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: `Extra "${this.selectedExtra?.name}" agregado`,
          life: 3000
        });
      },
      error: (error) => {
        this.loading = false;
        console.error('Error agregando extra:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo agregar el extra: ' + error.message
        });
      }
    });
  }

  removeExtra(orderExtraId: number, extraName: string): void {
    this.confirmationService.confirm({
      message: `¿Está seguro de eliminar "${extraName}" de la orden?`,
      header: 'Confirmar Eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, eliminar',
      rejectLabel: 'Cancelar',
      accept: () => {
        this.loading = true;
        this.extraService.removeExtraFromOrder(orderExtraId).subscribe({
          next: () => {
            this.extras = this.extras.filter(e => e.id !== orderExtraId);
            this.loading = false;
            
            // Emitir evento de actualización con sonido
            this.extrasUpdated.emit(this.calculateExtrasTotal());
            this.playUpdateSound();
            
            this.messageService.add({
              severity: 'success',
              summary: 'Eliminado',
              detail: `Extra "${extraName}" eliminado`
            });
          },
          error: (error) => {
            this.loading = false;
            console.error('Error eliminando extra:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'No se pudo eliminar el extra'
            });
          }
        });
      }
    });
  }

  playUpdateSound(): void {
    try {
      const audio = new Audio();
      audio.src = 'assets/sounds/update.mp3';
      audio.volume = 0.5;
      audio.play().catch(() => {
        // Fallback si no hay archivo
        const audioContext = new AudioContext();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = 1200;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.3);
      });
    } catch (error) {
      console.warn('No se pudo reproducir sonido:', error);
    }
  }

  getExtraSeverity(extra: OrderExtraM): string {
    if (extra.is_free) return 'success';
    return extra.unit_price > 5 ? 'warn' : 'info';
  }
}
