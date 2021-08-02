import { onAddCartNote } from "features/cart/cartSlice";
import React from "react";
import { useDispatch, useSelector } from "react-redux";

const NoteBox = ({ setShowAddNoteInput }) => {
  const dispatch = useDispatch();
  const cartNote = useSelector((state) => state.cart.cartNote);
  const [note, setNote] = React.useState(cartNote);

  return (
    <div className="font-medium bg-white z-10 w-full h-38 rounded shadow border border-gray-500 overflow-hidden">
      <div className="h-full">
        <p className="font-bold mt-2 px-2">
          <span>Note</span>
        </p>
        <hr />
        <div className="relative mt-4 px-2">
          <input
            value={note}
            onChange={(e) => {
              e.persist();
              setNote(e.target.value);
            }}
            type="text"
            placeholder="Add a note to this sale"
            className="px-3 py-3 placeholder-blueGray-500 text-blueGray-600 bg-white rounded border border-blue-500 outline-none focus:outline-none w-full"
          />
          <span
            className="z-10 absolute right-0 text-center text-red-500 w-8 pr-3 py-3 cursor-pointer"
            onClick={() => {
              setNote("");
              dispatch(onAddCartNote(""));
            }}
          >
            <i className="fas fa-times-circle"></i>
          </span>
        </div>
        <div className="flex justify-end w-full bg-gray-300 mt-2 p-2 ">
          <button
            className="text-white font-bold bg-red-700 px-3 py-1 mr-2 rounded"
            onClick={() => {
              setShowAddNoteInput(false);
            }}
          >
            Cancel
          </button>
          <button
            className="text-white font-bold bg-green-500 px-3 py-1 rounded"
            onClick={() => {
              dispatch(onAddCartNote(note));
              setShowAddNoteInput(false);
            }}
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
};

export default NoteBox;
