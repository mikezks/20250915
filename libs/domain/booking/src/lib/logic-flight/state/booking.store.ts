import { patchState, signalStore, withComputed, withMethods, withProps, withState } from '@ngrx/signals';
import { Flight } from '../model/flight';
import { computed, inject } from '@angular/core';
import { FlightFilter } from '../model/flight-filter';
import { FlightService } from '../data-access/flight.service';


export interface BookingState {
  filter: FlightFilter;
  basket: Record<number, boolean>;
  flights: Flight[]
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
    flights: [],
}


export const BookingStore = signalStore(
  { providedIn: 'root' },
  // State
  withState<BookingState>(initialBookingState),
  withComputed(store => ({
    delayedFlights: computed(
      () => store.flights().filter(flight => flight.delayed)
    ),
  })),
  // Updater
  withMethods(store => ({
      setFilter: (filter: FlightFilter) => patchState(store, { filter }),
      setFlights: (flights: Flight[]) => patchState(store, { flights }),
  })),
  // Side-Effects
  withMethods((
    store,
    flightService = inject(FlightService)
  ) =>  ({
    loadFlights: () => {
      flightService.find(
        store.filter.from(),
        store.filter.to(),
        store.filter.urgent()
      ).subscribe({
        next: flights => store.setFlights(flights)
      })
    }
  }))
);
