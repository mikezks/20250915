import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { Flight } from '../model/flight';
import { computed, inject } from '@angular/core';
import { FlightFilter } from '../model/flight-filter';
import { FlightService } from '../data-access/flight.service';


export const BookingStore = signalStore(
  withState({
    filter: {
      from: 'Hamburg',
      to: 'Graz',
      urgent: false
    },
    basket: {
      3: true,
      5: true,
    } as Record<number, boolean>,
    flights: [] as Flight[]
  }),
  withComputed(store => ({
    delayedFlights: computed(
      () => store.flights().filter(flight => flight.delayed)
    ),
  })),
  withMethods(store => {
    const flightService = inject(FlightService);

    return ({
      setFilter: (filter: FlightFilter) => patchState(store, { filter }),
      setFlights: (flights: Flight[]) => patchState(store, { flights }),
      loadFlights: () => {
        flightService.find(
          store.filter.from(),
          store.filter.to(),
          store.filter.urgent()
        ).subscribe({
          next: flights => patchState(store, { flights }),
        })
      }
    })
  }),
);
