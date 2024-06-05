export default function RadioGroup({
  options,
  value,
  size = 'w-8',
  onChange,
  className
}:
  {
    options: Option[],
    value: string,
    size?: string,
    onChange: (v: string) => void,
    className?: string
  })
{
  return (
    <div className={ "flex flex-row gap-2 items-center text-sm " + className ?? '' }>
      {
        options.map(o =>
          o.value === value || o.value === ''
            ? <div
              key={ o.value }
              className={
                size +
                " rounded-md text-white h-full text-center justify-center flex flex-col" +
                (o.value === '' ? '' : ' bg-blue-500')
              }
            >
              { o.name }
            </div>
            : <button
              key={ o.value }
              className={
                size +
                " h-full rounded-md border text-gray-600 bg-gray-50 hover:text-white hover:bg-blue-400"
              }
              onClick={ () => onChange(o.value) }
            >
              { o.name }
            </button>
        )
      }
    </div>
  )
}

export type Option = { name: string, value: string }
