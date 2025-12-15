import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Table, UpdateTablePositionRequest } from '../../models/table';
import { Subscription } from 'rxjs';
import { TableService } from '../../service/table-service';
import { DragService } from '../../service/drag-service';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-table-map',
  imports: [
    ToastModule,
    ButtonModule,
    CommonModule,
  ],
  templateUrl: './table-map.html',
  styleUrl: './table-map.scss',
})
export class TableMap implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('restaurantMap') mapContainer!: ElementRef;

  tables: Table[] = [];
  loading: boolean = false;
  scale: number = 1;
  private dragSubscription?: Subscription;

  // Configuración del plano
  mapConfig = {
    width: 800,
    height: 600,
    gridSize: 50,
    backgroundColor: '#f8f9fa'
  };

  // Mesa siendo arrastrada
  private draggedTable: Table | null = null;
  private dragOffset = { x: 0, y: 0 };

  constructor(
    private tableService: TableService,
    private dragService: DragService,
    private messageService: MessageService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.loadTables();
    this.dragSubscription = this.dragService.tableMoved$.subscribe(
      ({ tableId, newPosition }) => {
        this.updateTablePosition(tableId, newPosition);
      }
    );
  }

  ngAfterViewInit(): void {
    this.setupDragAndDrop();
  }

  ngOnDestroy(): void {
    this.dragSubscription?.unsubscribe();
  }

  loadTables(): void {
    this.loading = true;
    this.tableService.getTables(0, 100, false).subscribe({
      next: (tables) => {
        this.tables = tables.filter(table => table.is_active);
        this.loading = false;

        // <--- forzamos detección de cambios después de asignar las mesas
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error loading tables:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al cargar las mesas'
        });
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  setupDragAndDrop(): void {
    const mapElement = this.mapContainer.nativeElement;

    mapElement.addEventListener('dragover', (e: DragEvent) => {
      e.preventDefault();
      this.onDragOver(e);
    });

    mapElement.addEventListener('drop', (e: DragEvent) => {
      e.preventDefault();
      this.onDrop(e);
    });
  }

  onTableDragStart(event: DragEvent, table: Table): void {
    this.draggedTable = table;

    // Calcular offset del mouse respecto al centro de la mesa
    const rect = (event.target as HTMLElement).getBoundingClientRect();
    this.dragOffset = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    };

    // Establecer datos de transferencia
    event.dataTransfer?.setData('text/plain', table.id.toString());

    // Efecto visual de arrastre
    (event.target as HTMLElement).style.opacity = '0.6';
  }

  onTableDragEnd(event: DragEvent): void {
    (event.target as HTMLElement).style.opacity = '1';
    this.draggedTable = null;
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();

    if (this.draggedTable) {
      const mapRect = this.mapContainer.nativeElement.getBoundingClientRect();
      const x = event.clientX - mapRect.left - this.dragOffset.x;
      const y = event.clientY - mapRect.top - this.dragOffset.y;

      // Snap to grid
      const snappedX = Math.round(x / this.mapConfig.gridSize) * this.mapConfig.gridSize;
      const snappedY = Math.round(y / this.mapConfig.gridSize) * this.mapConfig.gridSize;

      // Actualizar posición visualmente
      const tableElement = document.querySelector(`[data-table-id="${this.draggedTable.id}"]`) as HTMLElement;
      if (tableElement) {
        tableElement.style.left = `${snappedX}px`;
        tableElement.style.top = `${snappedY}px`;
      }
    }
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();

    if (this.draggedTable) {
      const mapRect = this.mapContainer.nativeElement.getBoundingClientRect();
      const x = event.clientX - mapRect.left - this.dragOffset.x;
      const y = event.clientY - mapRect.top - this.dragOffset.y;

      // Snap to grid
      const snappedX = Math.round(x / this.mapConfig.gridSize) * this.mapConfig.gridSize;
      const snappedY = Math.round(y / this.mapConfig.gridSize) * this.mapConfig.gridSize;

      // Validar posición dentro del mapa
      const validX = Math.max(0, Math.min(snappedX, this.mapConfig.width - 60));
      const validY = Math.max(0, Math.min(snappedY, this.mapConfig.height - 60));

      // Emitir evento de movimiento
      this.dragService.emitTableMoved(this.draggedTable.id, { x: validX, y: validY });
    }
  }

  updateTablePosition(tableId: number, newPosition: { x: number, y: number }): void {
    const positionData: UpdateTablePositionRequest = {
      position_x: newPosition.x,
      position_y: newPosition.y
    };

    this.tableService.updateTablePosition(tableId, positionData).subscribe({
      next: (updatedTable) => {
        // Actualizar tabla localmente
        const tableIndex = this.tables.findIndex(t => t.id === tableId);
        if (tableIndex !== -1) {
          this.tables[tableIndex] = updatedTable;
        }

        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: `Mesa ${updatedTable.number} movida a posición (${newPosition.x}, ${newPosition.y})`
        });
      },
      error: (error) => {
        console.error('Error updating table position:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al actualizar la posición de la mesa'
        });
        // Recargar para restaurar posiciones
        this.loadTables();
      }
    });
  }

  getTableStyle(table: Table): any {
    return {
      'left.px': table.position_x,
      'top.px': table.position_y,
      'width.px': 50,
      'height.px': 50,
      'background-color': table.is_available ? '#4CAF50' : '#F44336',
      'cursor': 'grab'
    };
  }

  getTableIcon(table: Table): string {
    return table.is_available ? 'pi pi-check' : 'pi pi-times';
  }

  getTableSeverity(table: Table): string {
    return table.is_available ? 'success' : 'danger';
  }

  zoomIn(): void {
    this.scale = Math.min(2, this.scale + 0.1);
  }

  zoomOut(): void {
    this.scale = Math.max(0.5, this.scale - 0.1);
  }

  resetZoom(): void {
    this.scale = 1;
  }
}
