'use client'

import { useContext, useState } from "react";
import { ContextToaster, ToasterPosition, ToasterSize, ToasterType } from "../ui/toast";
import RadioGroup from "../ui/radio-group";
import { Button } from "../ui/button";
import
{ ChatBubbleLeftEllipsisIcon } from '@heroicons/react/24/outline';

export default function Page()
{
  const toaster = useContext(ContextToaster);
  const [size, setSize] = useState<ToasterSize>('medium');
  const [type, setType] = useState<ToasterType>('none');
  const [header, setHeader] = useState('Header');
  const [message, setMessage] = useState('Message');
  const [position, setPosition] = useState<ToasterPosition>('bottom-right');
  const [duration, setDuration] = useState(0);
  const [icon, setIcon] = useState(false);

  return (
    <div className="grid grid-cols-1 md:grid-cols-[min-content_min-content] items-center auto-cols-min gap-2">
      <div>Header:</div>
      <input
        type="text"
        value={ header }
        onChange={ e => setHeader(e.target.value) }
      />
      <div>Message:</div>
      <textarea
        cols={ 30 }
        rows={ 3 }
        value={ message }
        onChange={ e => setMessage(e.target.value) }
      />
      <div>Size:</div>
      <RadioGroup
        options={ [
          { name: 'small', value: 'small' },
          { name: 'medium', value: 'medium' },
          { name: 'big', value: 'big' }
        ] }
        value={ size }
        size='w-16'
        onChange={ (s: string) => setSize(s as ToasterSize) }
      />
      <div>Type:</div>
      <RadioGroup
        options={ [
          { name: 'none', value: 'none' },
          { name: 'success', value: 'success' },
          { name: 'info', value: 'info' },
          { name: 'warning', value: 'warning' },
          { name: 'error', value: 'error' }
        ] }
        value={ type }
        size='w-14'
        onChange={ (s: string) => setType(s as ToasterType) }
      />
      <div>Position:</div>
      <div className="flex flex-col gap-2">
        <RadioGroup
          options={ [
            { name: 'top left', value: 'top-left' },
            { name: 'top center', value: 'top-center' },
            { name: 'top right', value: 'top-right' },
          ] }
          value={ position }
          size='w-16'
          className="h-12"
          onChange={ (s: string) => setPosition(s as ToasterPosition) }
        />
        <RadioGroup
          options={ [
            { name: 'middle left', value: 'middle-left' },
            { name: '', value: '' },
            { name: 'middle right', value: 'middle-right' },
          ] }
          value={ position }
          size='w-16'
          className="h-12"
          onChange={ (s: string) => setPosition(s as ToasterPosition) }
        />
        <RadioGroup
          options={ [
            { name: 'bottom left', value: 'bottom-left' },
            { name: 'bottom center', value: 'bottom-center' },
            { name: 'bottom right', value: 'bottom-right' },
          ] }
          value={ position }
          size='w-16'
          className="h-12"
          onChange={ (s: string) => setPosition(s as ToasterPosition) }
        />
      </div>
      <div>Duration:</div>
      <input
        type="number"
        min={ 0 }
        value={ duration }
        step={ 100 }
        onChange={ e => setDuration(Number.parseInt(e.target.value)) }
      />
      <div className="flex flex-row items-center gap-2 md:col-span-2">
        <input
          type="checkbox"
          checked={ icon }
          id="icon"
          onChange={ (e) => setIcon(e.target.checked) }
        />
        <label htmlFor="icon">Show icon</label>
      </div>
      <Button
        className="justify-center w-48 flex flex-row gap-2 md:col-span-2"
        onClick={ () => toaster?.setTypeToaster({
          type: type,
          size: size,
          duration: duration,
          title: header,
          message: message,
          position: position,
          icon: icon
        }) }>
        <ChatBubbleLeftEllipsisIcon className="w-4" />
        <div>Display toaster</div>
      </Button>
      <div className="text-xs bg-gray-200 text-green-500">
        env={ process.env.NODE_ENV }<br />
        host={ process.env.MYSQL_HOST }
        db={ process.env.MYSQL_DATABASE }
      </div>
    </div>
  );
}