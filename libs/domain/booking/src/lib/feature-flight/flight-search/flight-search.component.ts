import { CommonModule } from '@angular/common';
import { Component, computed, DestroyRef, effect, inject, Injector, runInInjectionContext, signal, untracked, WritableSignal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Flight, FlightFilter, injectTicketsFacade } from '../../logic-flight';
import { FlightCardComponent, FlightFilterComponent } from '../../ui-flight';


@Component({
  selector: 'app-flight-search',
  imports: [
    CommonModule,
    FormsModule,
    FlightCardComponent,
    FlightFilterComponent
  ],
  templateUrl: './flight-search.component.html',
})
export class FlightSearchComponent {
  private ticketsFacade = injectTicketsFacade();
  private destroyRef = inject(DestroyRef);
  private injector = inject(Injector);

  protected filter = signal<FlightFilter>({
    from: 'Paris',
    to: 'New York',
    urgent: false
  });
  protected route = computed(
    () => 'From ' + this.filter().from + ' to ' + this.filter().to + '.'
  );
  protected basket: Record<number, boolean> = {
    3: true,
    5: true
  };
  protected flights$ = this.ticketsFacade.flights$;

  constructor() {
    this.initLoggerEffect();
  }

  private initLoggerEffect(): void {
    this.destroyRef.onDestroy(() => console.log('Bye, bye! :('));
    const loggerEffect = effect(() => {
      const route = this.route();
      untracked(() => console.log(route));
    });
    loggerEffect.destroy();
  }

  protected myLaterInvokedFn(): void {
    runInInjectionContext(
      this.injector,
      () => effect(() => console.log(this.route()))
    );
  }

  protected search(filter: FlightFilter): void {
    this.filter.set(filter);

    if (!this.filter().from || !this.filter().to) {
      return;
    }

    this.ticketsFacade.search(this.filter());
  }

  protected delay(flight: Flight): void {
    const oldFlight = flight;
    const oldDate = new Date(oldFlight.date);

    const newDate = new Date(oldDate.getTime() + 1000 * 60 * 5); // Add 5 min
    const newFlight = {
      ...oldFlight,
      date: newDate.toISOString(),
      delayed: true
    };

    this.ticketsFacade.update(newFlight);
  }

  protected reset(): void {
    this.ticketsFacade.reset();
  }
}
