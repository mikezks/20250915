import { DatePipe, NgStyle } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, linkedSignal, model, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { injectCdBlink } from '@flight-demo/shared/core';
import { Flight, initialFlight } from '../../logic-flight';


@Component({
  selector: 'app-flight-card',
  imports: [
    NgStyle, DatePipe,
    RouterLink
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="card"
      [ngStyle]="{ 'background-color': selected() ? 'rgb(204, 197, 185)' : 'white' }"
    >
      @let flight = this.flight();
      <div class="card-header">
        <h2 class="card-title">{{ flight.from }} - {{ flight.to }}</h2>
      </div>

      <div class="card-body">
        <p>Flight-No.: {{ flight.id }}</p>
        <p>Date: {{ flight.date | date : "dd.MM.yyyy HH:mm" }}</p>
        <p>
          <button
            (click)="toggleSelection()"
            class="btn btn-info btn-sm"
            style="min-width: 85px; margin-right: 5px"
          >{{ selected() ? "Remove" : "Select" }}</button>
          <a
            [routerLink]="['../edit', flight.id]"
            class="btn btn-success btn-sm"
            style="min-width: 85px; margin-right: 5px"
          >Edit</a>
          <button
            (click)="delay()"
            class="btn btn-danger btn-sm"
            style="min-width: 85px; margin-right: 5px"
          >Delay</button>
        </p>
      </div>
    </div>

    <!-- {{ blink() }} -->
  `
})
export class FlightCardComponent {
  blink = injectCdBlink();

  readonly item = input.required<Flight>();
  readonly selected = model(false);
  readonly delayTrigger = output<Flight>();
  protected flight = linkedSignal(() => this.item());

  constructor() {
    /* setTimeout(() => this.flight.set({
      ...this.item(),
      from: 'Los Angeles',
      date: new Date().toISOString()
    }), 3_000); */
  }

  toggleSelection(): void {
    this.selected.update(curr => !curr);
  }

  delay(): void {
    this.delayTrigger.emit(this.flight());
  }
}
