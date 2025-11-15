import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DragService {
  private tableMovedSource = new Subject<{tableId: number, newPosition: {x: number, y: number}}>();
  tableMoved$ = this.tableMovedSource.asObservable();

  emitTableMoved(tableId: number, newPosition: {x: number, y: number}) {
    this.tableMovedSource.next({tableId, newPosition});
  }
}
