import { Injectable } from '@angular/core';
import { WebsocketService } from './websocket-service';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  constructor(private websocketService: WebsocketService) {
    this.initializeWebSocketListeners();
  }

  private initializeWebSocketListeners(): void {
    // Escuchar notificaciones de WebSocket
    this.websocketService.notifications$.subscribe(notification => {
      console.log('🔔 Notificación recibida:', notification);

      if (notification.type === 'new_order') {
        this.handleNewOrder(notification.data);
      }
      // 🔥 AGREGAR: Manejar notificaciones de orden actualizada
      else if (notification.type === 'order_updated') {
        this.handleOrderUpdated(notification.data);
      }
    });
  }

  // 🔥 AGREGAR: Nuevo método para manejar órdenes actualizadas
  private handleOrderUpdated(orderData: any): void {
    console.log('🔄 Orden actualizada recibida:', orderData);

    // Reproducir el MISMO SONIDO que para nuevas órdenes
    this.playNotificationSound();

    // Mostrar notificación del navegador
    this.showBrowserNotification(
      'Orden Actualizada',
      `Orden #${orderData.id} actualizada - ${orderData.user_name} - Nuevo total: $${orderData.total_amount}`
    );

    // Emitir evento global para que los componentes lo capturen
    this.emitOrderUpdatedEvent(orderData);
  }

  // 🔥 AGREGAR: Emitir evento de orden actualizada
  private emitOrderUpdatedEvent(orderData: any): void {
    // Crear un evento personalizado que los componentes puedan escuchar
    const event = new CustomEvent('orderUpdated', {
      detail: orderData
    });
    window.dispatchEvent(event);
  }

  private handleNewOrder(orderData: any): void {
    console.log('🆕 Nueva orden recibida:', orderData);

    // Reproducir sonido
    this.playNotificationSound();

    // Mostrar notificación del navegador
    this.showBrowserNotification(
      'Nueva Orden Recibida',
      `Orden #${orderData.id} - ${orderData.user_name} - $${orderData.total_amount}`
    );

    // Emitir evento global para que los componentes lo capturen
    this.emitNewOrderEvent(orderData);
  }

  private playNotificationSound(): void {
    // Usar sonido base64 como fallback si no hay archivo
    try {
      // Intentar con archivo primero
      const audio = new Audio();
      audio.src = 'notificacion.mp3'; // Asegúrate de tener este archivo en assets/
      audio.volume = 1;
      audio.play().catch(() => {
        // Fallback: crear sonido con Web Audio API
        this.createFallbackSound();
      });
    } catch (error) {
      this.createFallbackSound();
    }
  }

  private createFallbackSound(): void {
    try {
      const audioContext = new AudioContext();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = 800;
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (error) {
      console.warn('No se pudo reproducir sonido de notificación:', error);
    }
  }

  private showBrowserNotification(title: string, body: string): void {
    if ('Notification' in window) {
      if (Notification.permission === 'granted') {
        new Notification(title, {
          body,
          icon: '/assets/icon.png',
          tag: 'new-order'
        });
      } else if (Notification.permission === 'default') {
        Notification.requestPermission().then(permission => {
          if (permission === 'granted') {
            new Notification(title, { body, icon: '/assets/icon.png' });
          }
        });
      }
    }
  }

  private emitNewOrderEvent(orderData: any): void {
    // Crear un evento personalizado que los componentes puedan escuchar
    const event = new CustomEvent('newOrderReceived', {
      detail: orderData
    });
    window.dispatchEvent(event);
  }

  public requestNotificationPermission(): void {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().then(permission => {
        console.log('Permiso de notificación:', permission);
      });
    }
  }
}
