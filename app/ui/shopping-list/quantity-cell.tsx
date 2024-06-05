import { useCallback, useEffect, useState } from "react";

export default function QuantityCell(
  { id, quantity, noGoodQuantity, onQuantityChange }
    : {
      id: number,
      quantity: number,
      noGoodQuantity: number,
      onQuantityChange: (id: number, q: number) => void
    })
{
  const [tempQuantity, setTempQuantity] = useState(quantity);
  const [newQuantity, setNewQuantity] = useState(quantity);
  const [sentQuantity, setSentQuantity] = useState(0);

  //effect for handling quantity changing
  //useEffect(() => setTempQuantity(quantity), [quantity]);

  //effect for handling updating error
  useEffect(() =>
  {
    //if we tried to save current value and failed, return to initial value
    if (noGoodQuantity === tempQuantity && quantity !== noGoodQuantity) {
      setTempQuantity(quantity);
      setNewQuantity(quantity);
      setSentQuantity(0);
    }
    //not to check tempQuantity or quantity (handled in another effect)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [noGoodQuantity]);

  //efect for request saving new quantity
  useEffect(() =>
  {
    if (quantity !== newQuantity && newQuantity !== sentQuantity) {
      onQuantityChange(id, newQuantity);
      setSentQuantity(newQuantity);
    }
  }, [id, newQuantity, onQuantityChange, quantity, sentQuantity]);

  //delayed quantity saving
  useEffect(() =>
  {
    //console.log(`id=${id} q=${quantity} t=${tempQuantity}`)
    let timer = setTimeout(() =>
    {
      setNewQuantity(tempQuantity);
      clearTimeout(timer);
    }, 1000);

    return () => clearInterval(timer);
  }, [tempQuantity]);

  return (
    <div className="flex flex-row gap-2 items-center justify-end">
      <button
        className="px-1 hover:bg-gray-200 hover:rounded-sm disabled:text-gray-300"
        disabled={ tempQuantity === 1 }
        onClick={ (e) =>
        {
          e.stopPropagation();
          setTempQuantity(q => q - 1);
        } }
      >
        -
      </button>
      <div className="w-8 text-right border px-1 rounded-md">
        { tempQuantity }
      </div>
      <button
        className="px-1 hover:bg-gray-200 hover:rounded-sm"
        onClick={ (e) =>
        {
          e.stopPropagation();
          setTempQuantity(q => q + 1);
        } }
      >
        +
      </button>
    </div>
  )
}