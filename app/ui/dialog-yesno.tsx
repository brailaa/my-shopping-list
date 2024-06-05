import { ReactEventHandler, createRef, useEffect } from "react";

export function YesNoDialog(
  { openModal, closeModal, children }:
    { openModal: boolean, closeModal: (response: boolean) => void, children?: React.ReactNode })
{
  const ref = createRef<HTMLDialogElement>();

  useEffect(() =>
  {
    if (openModal) {
      ref.current?.showModal();
    } else {
      ref.current?.close();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openModal]);

  return (
    <dialog
      ref={ ref }
      onCancel={ () => closeModal(false) }
      className="border-1 rounded-lg"
    >
      <div className="flex flex-col p-2">
        { children }
        <div className="my-2 flex flex-row items-center justify-center gap-2">
          <button
            onClick={ () => closeModal(true) }
            className="px-3 py-1 rounded-md text-white bg-gray-600 text-sm font-medium hover:text-green-400"
          >
            Yes
          </button>
          <button
            onClick={ () => closeModal(false) }
            className="px-3 py-1 rounded-md text-white bg-gray-600 text-sm font-medium hover:text-red-400"
          >
            No
          </button>
        </div>
      </div>
    </dialog>
  );
}