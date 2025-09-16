import { inject, Signal } from "@angular/core";
import { takeUntilDestroyed, toSignal } from "@angular/core/rxjs-interop";
import { AbstractControl } from "@angular/forms";
import { ActivatedRoute, NavigationEnd, Router } from "@angular/router";
import { filter, map, Observable, pairwise, pipe, startWith, Subscription, switchMap, tap, withLatestFrom } from "rxjs";


export type QueryParamsConnectorConfig = {
  updateFormWithQueryParamInitially: boolean;
};

export const defaultQueryParamsConnectorConfig: QueryParamsConnectorConfig = {
  updateFormWithQueryParamInitially: true
};

export type QueryParamsConnectorState<T> = {
  sameUrl: boolean;
  navIndex: number;
  valueIndex: number;
  updateForm: QueryParamsConnectorConfig['updateFormWithQueryParamInitially'];
  queryParamName: string;
  queryParam: T;
  controlValue: T;
};

function mergeQueryParamsConnectorConfig(
  config?: Partial<QueryParamsConnectorConfig>
): QueryParamsConnectorConfig {
  return {
    ...defaultQueryParamsConnectorConfig,
    ...config ?? {}
  };
}

function isNewNavigation<T>(state: QueryParamsConnectorState<T>): boolean {
  return (
    (!state.sameUrl && state.valueIndex === 0)
    || (state.navIndex === 0 && state.valueIndex === 0)
  );
}

function isInitialNavigation<T>(state: QueryParamsConnectorState<T>): boolean {
  return (
    state.navIndex === 0
    && state.valueIndex === 0
  );
}

function isNullishOrEmptyString(value: unknown): boolean {
  return (value ?? null) === null || value === '';
}

function handleQueryParamSync<T>(
  formOrControl: AbstractControl<T>,
  router: Router,
  state: QueryParamsConnectorState<T>
): T {
  if (
    isNewNavigation(state)
    && state.updateForm
    && state.queryParam
  ) {
    formOrControl.setValue(state.queryParam, { emitEvent: false });

    return state.queryParam;
  } else if (
    (
      !isInitialNavigation(state)
      && state.controlValue !== state.queryParam
    ) || (
      isInitialNavigation(state)
      && isNullishOrEmptyString(state.queryParam)
    ) || (!state.updateForm
      && state.controlValue
    )
  ) {
    router.navigate([], { queryParams: {
      [state.queryParamName]: state.controlValue
    }});
  }

  return state.controlValue;
}

function routerNavigationEnd(router: Router) {
  return router.events.pipe(
    filter(event => event instanceof NavigationEnd),
    startWith(true)
  );
}

function sameUrlState(getUrl: () => string) {
  return pipe(
    map(() => getUrl().split('?')[0]),
    pairwise(),
    map(([prev, curr]) => ({ sameUrl: prev === curr })),
  );
}

function addQueryParamState<T>(
  route: ActivatedRoute,
  queryParamName: string
) {
  return pipe(
    withLatestFrom<T, unknown[]>(route.queryParamMap.pipe(
      map(params => params.get(queryParamName))
    )),
    map(([state, queryParam]) => ({ ...state, queryParam }))
  );
}

function getFormQueryParamConnector<T>(
  formOrControl: AbstractControl<T>,
  queryParamName: string,
  config?: Partial<QueryParamsConnectorConfig>
): Observable<T> {
  const router = inject(Router);
  const route = inject(ActivatedRoute);

  const {
    updateFormWithQueryParamInitially: updateForm 
  } = mergeQueryParamsConnectorConfig(config);

  return routerNavigationEnd(router).pipe(
    sameUrlState(() => router.url),
    addQueryParamState(route, queryParamName),
    switchMap(({ sameUrl, queryParam }, navIndex) => formOrControl.valueChanges.pipe(
      map((controlValue, valueIndex) => ({
        sameUrl, navIndex, valueIndex, updateForm, 
        queryParamName, queryParam, controlValue, 
      }) as QueryParamsConnectorState<T>),
      map(state => handleQueryParamSync(formOrControl, router, state))
    )),
    takeUntilDestroyed()
  );
}

export function injectFormQueryParamConnector<T>(
  formOrControl: AbstractControl<T>,
  queryParamName: string,
  config?: Partial<QueryParamsConnectorConfig>
): Subscription {
  return getFormQueryParamConnector(
    formOrControl, queryParamName, config
  ).subscribe();
}

export function connectFormQueryParamSignal<T>(
  formOrControl: AbstractControl<T>,
  queryParamName: string,
  config?: Partial<QueryParamsConnectorConfig>
): Signal<T> {
  return toSignal(getFormQueryParamConnector(
    formOrControl, queryParamName, config
  ), { initialValue: formOrControl.getRawValue() });
}
