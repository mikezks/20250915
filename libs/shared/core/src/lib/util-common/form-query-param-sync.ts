import { inject } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { AbstractControl } from "@angular/forms";
import { ActivatedRoute, NavigationEnd, Router } from "@angular/router";
import { filter, map, of, pairwise, startWith, switchMap, tap, withLatestFrom } from "rxjs";


export type QueryParamsConnectorConfig = {
  updateFormWithQueryParamInitially: boolean;
};

export const defaultQueryParamsConnectorConfig: QueryParamsConnectorConfig = {
  updateFormWithQueryParamInitially: true
};

export type QueryParamsConnectorState = {
  sameUrl: boolean;
  navIndex: number;
  valueIndex: number;
  updateForm: QueryParamsConnectorConfig['updateFormWithQueryParamInitially'];
  queryParamName: string;
  queryParam: unknown;
  controlValue: unknown;
};

function mergeQueryParamsConnectorConfig(
  config?: Partial<QueryParamsConnectorConfig>
): QueryParamsConnectorConfig {
  return {
    ...defaultQueryParamsConnectorConfig,
    ...config ?? {}
  };
}

function isNewNavigation(state: QueryParamsConnectorState): boolean {
  return (
    (!state.sameUrl && state.valueIndex === 0)
    || (state.navIndex === 0 && state.valueIndex === 0)
  );
}

function isInitialNavigation(state: QueryParamsConnectorState): boolean {
  return (
    state.navIndex === 0
    && state.valueIndex === 0
  );
}

function isNullishOrEmptyString(value: unknown): boolean {
  return (value ?? null) === null || value === '';
}

function handleQueryParamSync(
  formOrControl: AbstractControl,
  router: Router,
  state: QueryParamsConnectorState
): void {
  if (
    isNewNavigation(state)
    && state.updateForm
    && state.queryParam
  ) {
    formOrControl.setValue(state.queryParam, { emitEvent: false });
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
}


export function injectFormQueryParamConnector(
  formOrControl: AbstractControl,
  queryParamName: string,
  config?: Partial<QueryParamsConnectorConfig>
) {
  const router = inject(Router);
  const route = inject(ActivatedRoute);

  const {
    updateFormWithQueryParamInitially: updateForm 
  } = mergeQueryParamsConnectorConfig(config);

  router.events.pipe(
    filter(event => event instanceof NavigationEnd),
    startWith(true),
    map(() => router.url.split('?')[0]),
    pairwise(),
    map(([prev, curr]) => ({ sameUrl: prev === curr })),
    withLatestFrom(route.queryParamMap.pipe(
      map(params => params.get(queryParamName))
    )),
    map(([state, queryParam]) => ({ ...state, queryParam })),
    switchMap(({ sameUrl, queryParam }, navIndex) => formOrControl.valueChanges.pipe(
      switchMap((controlValue, valueIndex) => of(controlValue).pipe(
        map(() => ({
          sameUrl, navIndex, valueIndex, updateForm, 
          queryParamName, queryParam, controlValue, 
        }) as QueryParamsConnectorState),
        tap(state => handleQueryParamSync(formOrControl, router, state)),
      )),
    )),
    takeUntilDestroyed()
  ).subscribe();
}
