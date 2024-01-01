import { Component } from '@angular/core';

@Component({
  selector: 'app-counter-component',
  templateUrl: './order.component.html'
})
export class OrderComponent {
  public currentCount = 0;

  public incrementCounter() {
    this.currentCount++;
  }
}
