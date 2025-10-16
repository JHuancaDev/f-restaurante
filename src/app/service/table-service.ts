import { Injectable } from '@angular/core';
import { RestaurantLayout, Table } from '../models/table';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TableService {
  private readonly STORAGE_KEY = 'restaurant_layout';
  private tablesSubject: BehaviorSubject<Table[]>;
  private nextTableNumber = 1;

  constructor() {
    const savedLayout = this.loadLayout();
    this.tablesSubject = new BehaviorSubject<Table[]>(savedLayout.tables);
    this.nextTableNumber = this.calculateNextTableNumber(savedLayout.tables);
  }

  get tables$(): Observable<Table[]> {
    return this.tablesSubject.asObservable();
  }

  getTables(): Table[] {
    return this.tablesSubject.value;
  }

  addTable(seats: number = 4, shape: 'rectangle' | 'circle' = 'rectangle'): void {
    const tables = this.getTables();
    const newTable: Table = {
      id: this.generateId(),
      number: this.nextTableNumber++,
      seats,
      x: 50,
      y: 50,
      width: shape === 'rectangle' ? 120 : 100,
      height: shape === 'rectangle' ? 80 : 100,
      shape
    };

    const updatedTables = [...tables, newTable];
    this.tablesSubject.next(updatedTables);
    this.saveLayout(updatedTables);
  }

  updateTable(table: Table): void {
    const tables = this.getTables();
    const index = tables.findIndex(t => t.id === table.id);

    if (index !== -1) {
      tables[index] = { ...table };
      this.tablesSubject.next([...tables]);
      this.saveLayout(tables);
    }
  }

  deleteTable(tableId: string): void {
    const tables = this.getTables().filter(t => t.id !== tableId);
    this.tablesSubject.next(tables);
    this.saveLayout(tables);
  }

  updateTablePosition(tableId: string, x: number, y: number): void {
    const tables = this.getTables();
    const table = tables.find(t => t.id === tableId);

    if (table) {
      table.x = x;
      table.y = y;
      this.tablesSubject.next([...tables]);
      this.saveLayout(tables);
    }
  }

  clearAllTables(): void {
    this.tablesSubject.next([]);
    this.nextTableNumber = 1;
    this.saveLayout([]);
  }

  private generateId(): string {
    return `table_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private calculateNextTableNumber(tables: Table[]): number {
    if (tables.length === 0) return 1;
    const maxNumber = Math.max(...tables.map(t => t.number));
    return maxNumber + 1;
  }

  private saveLayout(tables: Table[]): void {
    const layout: RestaurantLayout = {
      tables,
      lastUpdated: new Date()
    };

    // En producción, aquí usarías localStorage:
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(layout));

    // Para este entorno, usamos una variable en memoria
    //if (typeof window !== 'undefined') {
    //  (window as any).__restaurantLayout = layout;
    //}
  }

  private loadLayout(): RestaurantLayout {
    try {
      // En producción, usarías:
       const saved = localStorage.getItem(this.STORAGE_KEY);

      // Para este entorno, leemos de memoria
       //const saved = typeof window !== 'undefined'
        // ? (window as any).__restaurantLayout
        // : null;

      if (saved) {
        return typeof saved === 'string' ? JSON.parse(saved) : saved;
      }
    } catch (error) {
      console.error('Error loading layout:', error);
    }

    return { tables: [], lastUpdated: new Date() };
  }
}
