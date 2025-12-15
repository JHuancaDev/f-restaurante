import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { TableService } from '../../service/table-service';
import { Table } from '../../models/table';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { RouterModule } from '@angular/router';
import { TableModule } from 'primeng/table';
import { CheckboxModule } from 'primeng/checkbox';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastModule } from 'primeng/toast';
import { ConfirmPopupModule } from 'primeng/confirmpopup';

@Component({
  selector: 'app-table-list',
  standalone: true,
  imports: [
    TagModule,
    ButtonModule,
    RouterModule,
    TableModule,
    CheckboxModule,
    CommonModule,
    FormsModule,
    ToastModule,
    ConfirmPopupModule
  ],
  templateUrl: './table-list.html',
  styleUrls: ['./table-list.scss']
})
export class TableList implements OnInit {
  tables: Table[] = [];
  loading: boolean = false;
  showAvailableOnly: boolean = false;

  constructor(
    private tableService: TableService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {

    this.loadTables();
  }

  loadTables(): void {
    this.loading = true;
    this.tableService.getTables(0, 100, this.showAvailableOnly).subscribe({
      next: (tables) => {
        this.tables = tables;
        this.loading = false;
        this.cdr.detectChanges(); // fuerza que Angular refresque la vista
      },
      error: (error) => {
        console.error('Error loading tables:', error);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }


  onAvailableOnlyChange(): void {
    this.loadTables();
  }

  deleteTable(table: Table): void {
    this.confirmationService.confirm({
      message: `¿Estás seguro de que deseas eliminar la mesa ${table.number}?`,
      header: 'Confirmar Eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí',
      rejectLabel: 'No',
      accept: () => {
        this.tableService.deleteTable(table.id).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Éxito',
              detail: 'Mesa eliminada correctamente'
            });
            this.loadTables();
          },
          error: (error) => {
            console.error('Error deleting table:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Error al eliminar la mesa'
            });
          }
        });
      }
    });
  }

  toggleAvailability(table: Table): void {
    const updateData = { is_available: !table.is_available };
    this.tableService.updateTable(table.id, updateData).subscribe({
      next: (updatedTable) => {
        table.is_available = updatedTable.is_available;
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: `Mesa ${updatedTable.is_available ? 'disponible' : 'no disponible'}`
        });
      },
      error: (error) => {
        console.error('Error updating table:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al actualizar la mesa'
        });
      }
    });
  }
}
