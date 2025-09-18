import { patchState, signalStore, type, withComputed, withHooks, withMethods, withProps, withState } from '@ngrx/signals';
import { entityConfig, setAllEntities, updateEntity, withEntities } from '@ngrx/signals/entities';
import { tapResponse } from '@ngrx/operators';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { Flight } from '../model/flight';
import { computed, inject } from '@angular/core';
import { FlightFilter } from '../model/flight-filter';
import { FlightService } from '../data-access/flight.service';
import { pipe, switchMap } from 'rxjs';
import { addMinutes } from '@flight-demo/shared/core';


export interface BookingState {
  filter: FlightFilter;
  basket: Record<number, boolean>;
}

export const initialBookingState: BookingState = {
  filter: {
      from: 'Hamburg',
      to: 'Graz',
      urgent: false
    },
    basket: {
      3: true,
      5: true,
    },
}

const flightConfig = entityConfig({
  entity: type<Flight>(),
  collection: 'flight'
});


export const BookingStore = signalStore(
  { providedIn: 'root' },
  // State
  withState<BookingState>(initialBookingState),
  withEntities(flightConfig),
  withComputed(store => ({
    delayedFlights: computed(
      () => store.flightEntities().filter(flight => flight.delayed)
    ),
  })),
  // Updater
  withMethods(store => ({
    setFilter: (filter: FlightFilter) => patchState(store, { filter }),
    setFlights: (flights: Flight[]) =>
      patchState(store, setAllEntities(flights, flightConfig)),
    addFlightDelay: (id: number, min = 5) =>
      patchState(store, updateEntity({ id, changes: flight => ({
        ...flight, date: addMinutes(flight.date, min)
      })}, flightConfig)),
    updateBasket: (id: number, selected: boolean) =>
      patchState(store, state => ({ basket: {
        ...state.basket,
        [id]: selected
      }})),
  })),
  // Side-Effects
  withMethods((
    store,
    flightService = inject(FlightService)
  ) =>  ({
    loadFlights$: rxMethod<FlightFilter>(pipe(
      switchMap(filter => flightService.find(
        filter.from,
        filter.to,
        filter.urgent
      )),
      tapResponse({
        next: flights => store.setFlights(flights),
        error: err => console.error(err)
      })
    )),
  })),
  withHooks({
    onInit: store => store.loadFlights$(store.filter),
  })
);
