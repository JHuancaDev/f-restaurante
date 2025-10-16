import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableService } from '../../service/table-service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Table } from '../../models/table';
import { Subject, takeUntil } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { ToolbarModule } from 'primeng/toolbar';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { CardModule } from 'primeng/card';
import { InputNumberModule } from 'primeng/inputnumber';
import { DialogModule } from 'primeng/dialog';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-edit-table',
  imports: [CommonModule,
    ButtonModule,
    ToolbarModule,
    ToastModule,
    ConfirmDialogModule,
    CardModule,
    InputNumberModule,
    CommonModule,
    DialogModule,
    AutoCompleteModule,
    FormsModule,
    
  ],
  templateUrl: './edit-table.html',
  styleUrl: './edit-table.scss'
})
export class EditTable implements OnInit {
  tables: Table[] = [];
  showAddDialog = false;
  selectedTable: Table | null = null;
  draggedTable: Table | null = null;

  newTableSeats = 4;
  newTableShape: 'rectangle' | 'circle' = 'rectangle';

  shapeOptions = [
    { label: 'Rectangular', value: 'rectangle' },
    { label: 'Circular', value: 'circle' }
  ];

  private destroy$ = new Subject<void>();

  constructor(
    private tableService: TableService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) { }

  ngOnInit(): void {
    this.tableService.tables$
      .pipe(takeUntil(this.destroy$))
      .subscribe(tables => {
        this.tables = tables;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  openAddDialog(): void {
    this.showAddDialog = true;
    this.newTableSeats = 4;
    this.newTableShape = 'rectangle';
  }

  addTable(): void {
    this.tableService.addTable(this.newTableSeats, this.newTableShape);
    this.showAddDialog = false;
    this.messageService.add({
      severity: 'success',
      summary: 'Mesa Añadida',
      detail: `Mesa ${this.tables.length} agregada exitosamente`
    });
  }

  deleteTable(table: Table): void {
    this.confirmationService.confirm({
      message: `¿Está seguro de eliminar la Mesa ${table.number}?`,
      header: 'Confirmar Eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí',
      rejectLabel: 'No',
      accept: () => {
        this.tableService.deleteTable(table.id);
        this.messageService.add({
          severity: 'info',
          summary: 'Mesa Eliminada',
          detail: `Mesa ${table.number} eliminada`
        });
      }
    });
  }

  clearAll(): void {
    this.confirmationService.confirm({
      message: '¿Está seguro de eliminar todas las mesas?',
      header: 'Confirmar Limpieza',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí',
      rejectLabel: 'No',
      accept: () => {
        this.tableService.clearAllTables();
        this.messageService.add({
          severity: 'warn',
          summary: 'Todas las Mesas Eliminadas',
          detail: 'La distribución ha sido limpiada'
        });
      }
    });
  }

  onDragStart(event: DragEvent, table: Table): void {
    this.draggedTable = table;
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
    }
  }

  onDragEnd(event: DragEvent): void {
    this.draggedTable = null;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();

    if (this.draggedTable) {
      const restaurantArea = event.currentTarget as HTMLElement;
      const rect = restaurantArea.getBoundingClientRect();

      const x = event.clientX - rect.left - (this.draggedTable.width / 2);
      const y = event.clientY - rect.top - (this.draggedTable.height / 2);

      // Mantener dentro de los límites
      const maxX = rect.width - this.draggedTable.width;
      const maxY = rect.height - this.draggedTable.height;

      const boundedX = Math.max(0, Math.min(x, maxX));
      const boundedY = Math.max(0, Math.min(y, maxY));

      this.tableService.updateTablePosition(this.draggedTable.id, boundedX, boundedY);
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move';
    }
  }

  selectTable(table: Table): void {
    this.selectedTable = this.selectedTable?.id === table.id ? null : table;
  }

  updateTableSeats(table: Table, seats: number): void {
    const updated = { ...table, seats };
    this.tableService.updateTable(updated);
    this.messageService.add({
      severity: 'success',
      summary: 'Mesa Actualizada',
      detail: `Mesa ${table.number} ahora tiene ${seats} sillas`
    });
  }

  getTableStyle(table: Table): any {
    return {
      left: `${table.x}px`,
      top: `${table.y}px`,
      width: `${table.width}px`,
      height: `${table.height}px`,
      borderRadius: table.shape === 'circle' ? '50%' : '8px'
    };
  }
  get totalSeats(): number {
  return this.tables.reduce((sum, t) => sum + t.seats, 0);
}

}