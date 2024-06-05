'use client';

import { createContext, useEffect, useMemo, useState, useRef } from "react";
import
{
  InformationCircleIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';

export const ContextToaster = createContext<IContextToaster | null>(null);

export type ToasterType = 'success' | 'error' | 'info' | 'warning' | 'none';
export type ToasterSize = 'small' | 'medium' | 'big';
export type ToasterPosition = 'top-left' | 'top-center' | 'top-right' | 'middle-left' | 'middle-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
export type MyToaster = {
  type?: ToasterType, //default to none
  title?: string,
  message?: string,
  size?: ToasterSize //default to medium
  position?: ToasterPosition,
  duration?: number, //default to 3000
  icon?: boolean
}

export const emptyToaster: MyToaster = {};

export interface IContextToaster
{
  typeToaster: MyToaster,
  setTypeToaster: React.Dispatch<
    React.SetStateAction<IContextToaster['typeToaster']>
  >
}

export const ProviderContextToaster = ({ children }: { children: React.ReactNode }) =>
{
  const [open, setOpen] = useState(false);
  const [toaster, setToaster] = useState<IContextToaster['typeToaster']>(emptyToaster);
  const valoare = useMemo(() => ({ typeToaster: toaster, setTypeToaster: setToaster }), [toaster]);
  const timerRef = useRef(0);
  let iconClass = 'mr-1 ';
  let classToast = "fixed hidden w-fit min-w-44 max-w-64 md:max-w-md p-2 leading-none z-10 data-[open=true]:flex flex-row items-start border border-l-8 rounded-lg shadow-lg bg-gray-50 text-gray-600 opacity-100 ";
  let headerClass = "font-medium m-0 ";
  switch (toaster.size) {
    case 'small':
      classToast += 'text-sm ';
      //headerClass += 'text-base ';
      iconClass += 'min-w-6 h-6 ';
      break;
    case 'big':
      classToast += 'text-lg ';
      //headerClass += 'text-xl ';
      iconClass += 'min-w-10 h-10 ';
      break;
    default:
      classToast += 'text-base ';
      //headerClass += 'text-lg ';
      iconClass += 'min-w-8 h-8 ';
  }
  let iconComponent: JSX.Element | undefined = undefined;
  switch (toaster.type) {
    case 'success':
      classToast += 'border-green-600 ';
      headerClass += 'text-green-500 ';
      if (toaster.icon) {
        iconComponent = <CheckCircleIcon className={ iconClass + "text-green-500" } />;
      }
      break;
    case 'error':
      classToast += 'border-red-600 ';
      headerClass += 'text-red-500 ';
      if (toaster.icon) {
        iconComponent = <XCircleIcon className={ iconClass + "text-red-500" } />;
      }
      break;
    case 'info':
      classToast += 'border-sky-600 ';
      headerClass += 'text-sky-500 ';
      if (toaster.icon) {
        iconComponent = <InformationCircleIcon className={ iconClass + "text-sky-500" } />;
      }
      break;
    case 'warning':
      classToast += 'border-amber-600 ';
      headerClass += 'text-amber-500 ';
      if (toaster.icon) {
        iconComponent = <ExclamationTriangleIcon className={ iconClass + "text-amber-500" } />;
      }
      break;
    default:
      classToast += 'border-gray-600 ';
      headerClass += 'text-black ';
  }
  classToast += (
    toaster.position?.startsWith('top-') ?
      'top-8 ' : (
        toaster.position?.startsWith('middle-') ?
          'top-1/2 -translate-y-1/2 ' : 'bottom-8 '
      )
  ) + (
      toaster.position?.endsWith('-left') ?
        'left-8 ' : (
          toaster.position?.endsWith('-center') ?
            'left-1/2 -translate-x-1/2 ' : 'right-8 '
        )
    );

  function hide()
  {
    setOpen(false);
    setToaster(emptyToaster);
    window.clearTimeout(timerRef.current);
  }

  useEffect(() =>
  {
    const display = (JSON.stringify(toaster) !== JSON.stringify(emptyToaster));
    if (window && (open || display)) {
      if (display) {
        window.clearTimeout(timerRef.current);
        timerRef.current = window.setTimeout(() =>
        {
          setOpen(true);
          const duration = toaster.duration ?? 3000;
          if (duration) {
            timerRef.current = window.setTimeout(() =>
            {
              hide();
            }, duration);
          }
        }, 100);
      } else {
        hide();
      }
    }
  }, [open, toaster]);

  return (
    <ContextToaster.Provider value={ valoare }>
      { children }
      <div
        className={ classToast }
        data-open={ open }
        onClick={ () => { hide() } }
      >
        { iconComponent }
        <div className="flex flex-col items-start grow">
          <p className={ headerClass }>
            { toaster.title }
          </p>
          <p>{ toaster.message }</p>
        </div>
      </div>
    </ContextToaster.Provider>
  );
}