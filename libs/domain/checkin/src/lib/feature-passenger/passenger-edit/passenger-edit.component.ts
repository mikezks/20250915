import { Component, effect, inject, input, numberAttribute } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { injectFormQueryParamConnector } from '@flight-demo/shared/core';
import { switchMap } from 'rxjs';
import { initialPassenger } from '../../logic-passenger';
import { PassengerService } from '../../logic-passenger/data-access/passenger.service';
import { validatePassengerStatus } from '../../util-validation';


@Component({
  selector: 'app-passenger-edit',
  imports: [
    ReactiveFormsModule,
    RouterLink
  ],
  templateUrl: './passenger-edit.component.html'
})
export class PassengerEditComponent {
  private passengerService = inject(PassengerService);
  protected editForm = inject(NonNullableFormBuilder).group({
    id: [0],
    firstName: [''],
    name: [''],
    bonusMiles: [0],
    passengerStatus: ['', [
      validatePassengerStatus(['A', 'B', 'C'])
    ]]
  });

  id = input(0, { transform: numberAttribute });
  private passenger = toSignal(
    toObservable(this.id).pipe(
      switchMap(id => this.passengerService.findById(id))
    ), { initialValue: initialPassenger }
  );

  /**
   * switchMap  -> cancel
   * concatMap  -> wait
   * exhaustMap -> ignore while inner is still running
   * mergeMap   -> parallel
   */

  constructor() {
    injectFormQueryParamConnector(
      this.editForm.controls.bonusMiles,
      'bonusMiles',
      { updateFormWithQueryParamInitially: true }
    );
    effect(() => this.editForm.patchValue(this.passenger()));
  }

  protected save(): void {
    console.log(this.editForm.value);
  }
}
