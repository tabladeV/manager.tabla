import { Clock, GripVertical, Trash, User2, Users2 } from "lucide-react";
import { useDrag } from "react-dnd";

const DraggableReservationItem: React.FC<any> = ({
    reservation,
    fromTableId,
    // Include dimension and appearance properties for the preview
    type,
    x,
    y,
    height,
    width,
    max,
    name,
    setTargetReservation,
    setShowConfirmPopup
  }) => {
    const [{ isDragging }, drag] = useDrag(() => ({
      type: "RESERVATION_LIST_ITEM",
      item: {
        ...reservation,
        fromTableId,
        // Include dimension and appearance properties for the preview
        type,
        x,
        y,
        height,
        width,
        max,
        name
      },
      collect: (monitor) => {
        return {
          isDragging: monitor.isDragging(),
        }
      },
      canDrag: true,
    }));
    return (
      <div
        ref={drag}
        className={`${isDragging ? 'opacity-50' : 'opacity-100'} cursor-grab p-2 flex justify-between items-center gap-2 rounded-[5px] mt-1 font-semibold dark:bg-bgdarktheme bg-softgreytheme`}
      >
        <GripVertical />
        <div className='flex flex-col items-start '>
          <div className='flex items-center justify-between'>
            <div className='flex mr-1 items-center'><Clock size={16} className='mr-1' /> <span> {reservation.time?.replace(':00', '')}</span></div>
            <div className='flex items-center'><Users2 size={16} className='mr-1' /> <span> {reservation.number_of_guests}</span></div>
          </div>
          <div className='flex items-center'><User2 size={16} className='mr-1' /> <span>{reservation.full_name}</span></div>
        </div>
        <Trash
          size={30}
          className="bg-softredtheme text-redtheme p-2 rounded-md cursor-pointer"
          onClick={() => {
            setTargetReservation(reservation)
            setShowConfirmPopup(true)
          }}
        />
      </div>
    )
  }

  export default DraggableReservationItem;