import { Injectable } from '@angular/core';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { environment } from '../../environments/environment';
import { Observable, Subject, timer } from 'rxjs';
import { retryWhen, delayWhen, tap } from 'rxjs/operators';


export interface OrderNotification {
  type: string;
  data: any;
  timestamp: string;
}

@Injectable({
  providedIn: 'root',
})
export class WebsocketService {
private socket$: WebSocketSubject<any> | null = null;
  private notificationSubject = new Subject<OrderNotification>();
  private isConnected = false;

  public notifications$ = this.notificationSubject.asObservable();

  constructor() {
    this.connect();
  }

  private connect(): void {
    const wsUrl = environment.wsUrl;
    console.log('🔗 Conectando a WebSocket:', wsUrl);

    try {
      this.socket$ = webSocket({
        url: wsUrl,
        openObserver: {
          next: () => {
            console.log('✅ Conexión WebSocket establecida');
            this.isConnected = true;
          }
        },
        closeObserver: {
          next: () => {
            console.log('🔌 Conexión WebSocket cerrada');
            this.isConnected = false;
            this.scheduleReconnect();
          }
        }
      });

      // Escuchar mensajes
      this.socket$.subscribe({
        next: (message) => {
          console.log('📨 Mensaje WebSocket recibido:', message);
          this.handleMessage(message);
        },
        error: (error) => {
          console.error('💥 Error WebSocket:', error);
          this.isConnected = false;
          this.scheduleReconnect();
        },
        complete: () => {
          console.log('🏁 Conexión WebSocket completada');
          this.isConnected = false;
          this.scheduleReconnect();
        }
      });

    } catch (error) {
      console.error('❌ Error creando conexión WebSocket:', error);
      this.scheduleReconnect();
    }
  }

  private scheduleReconnect(): void {
    console.log('🔄 Reconectando en 5 segundos...');
    setTimeout(() => {
      if (!this.isConnected) {
        this.connect();
      }
    }, 5000);
  }

  private handleMessage(message: any): void {
    try {
      console.log('📨 Procesando mensaje WebSocket:', message);

      const notification: OrderNotification = typeof message === 'string' 
        ? JSON.parse(message) 
        : message;

      // Filtrar mensajes de sistema
      if (notification.type === 'ping' || notification.type === 'pong' || notification.type === 'connection_established') {
        console.log('⚡ Mensaje de sistema:', notification.type);
        return;
      }

      console.log('🔔 Notificación procesada:', notification);
      this.notificationSubject.next(notification);

    } catch (error) {
      console.error('❌ Error procesando mensaje WebSocket:', error, message);
    }
  }

  public sendMessage(message: any): void {
    if (this.socket$ && !this.socket$.closed) {
      this.socket$.next(JSON.stringify(message));
    }
  }

  public get connectionStatus(): boolean {
    return this.isConnected;
  }

  public close(): void {
    this.isConnected = false;
    if (this.socket$) {
      this.socket$.complete();
    }
  }
}
