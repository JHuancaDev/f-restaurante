import { Component, OnInit } from '@angular/core';
import { Table } from '../../models/table';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TableService } from '../../service/table-service';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { CommonModule } from '@angular/common';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

@Component({
  selector: 'app-table-detail',
  imports: [
    ToastModule,
    CardModule,
    TagModule,
    CommonModule,
    RouterModule,
    ProgressSpinnerModule
  ],
  templateUrl: './table-detail.html',
  styleUrl: './table-detail.scss',
})
export class TableDetail implements OnInit{
  table: Table | null = null;
  loading: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private tableService: TableService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.loadTable();
  }

  loadTable(): void {
    const tableId = +this.route.snapshot.params['id'];
    this.loading = true;

    this.tableService.getTableById(tableId).subscribe({
      next: (table) => {
        this.table = table;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading table:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al cargar los datos de la mesa'
        });
        this.loading = false;
        this.router.navigate(['/tables']);
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/tables/map']);
  }
}
