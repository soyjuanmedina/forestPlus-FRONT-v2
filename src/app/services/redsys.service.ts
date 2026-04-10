import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { RedsysPaymentResponseDto, RedsysPaymentsControllerService, RedsysNotificationRequestDto } from '../api';

@Injectable({
  providedIn: 'root'
})
export class RedsysService {

  constructor(private redsysApi: RedsysPaymentsControllerService) { }

  /**
   * Solicita al backend los datos de pago para un pedido
   * @param orderId ID del pedido
   * @returns Observable con los parámetros de Redsys
   */
  createPayment(orderId: number): Observable<RedsysPaymentResponseDto> {
    return this.redsysApi.createPayment(orderId);
  }

  /**
   * Envía la notificación de Redsys al backend
   * @param notification Objeto con los datos de notificación de Redsys
   * @returns Observable con la respuesta del backend
   */
  handleNotification(notification: RedsysNotificationRequestDto): Observable<string> {
    return this.redsysApi.handleNotification(notification);
  }

  /**
   * Redirige al usuario a Redsys con los parámetros recibidos del backend
   * @param paymentData Parámetros de Redsys obtenidos del backend
   */
  sendToRedsys(paymentData: RedsysPaymentResponseDto): void {
    if (!paymentData.redsysUrl || !paymentData.parameters) {
      console.error('Redsys URL or parameters missing', paymentData);
      return;
    }

    const form = document.createElement('form');
    form.method = 'POST';
    form.action = paymentData.redsysUrl;

    Object.entries(paymentData.parameters).forEach(([key, value]) => {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = key;
      input.value = value;
      form.appendChild(input);
    });

    document.body.appendChild(form);
    form.submit();
  }
}
