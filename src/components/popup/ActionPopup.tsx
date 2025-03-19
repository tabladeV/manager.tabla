import { useState } from "react"

interface ConfirmPopupProps {
    action : 'delete' | 'update' | 'create'
    showPopup: boolean
    setShowPopup: (showPopup:boolean) => void
    message?: string
    actionFunction: () => void
}

const ActionPopup = (props:ConfirmPopupProps) => {

    const [showPopup, setShowPopup] = useState(props.showPopup || false)
  return (
    <div>
        {showPopup &&
        <div className="">
            <div className="overlay" onClick={()=>{setShowPopup(false)}}></div>
            <div className={`popup flex flex-col items-center text-center p-2 ${localStorage.getItem('darkMode') === 'true' ? 'bg-darkthemeitems' : 'bg-white'}`}>
                <div className="">
                    <h2>{props.action}</h2>
                </div>
                <div className="">
                    <p>{props.message}</p>
                </div>
                <div className="flex gap-3 mt-4">
                    <button className={`btn ${localStorage.getItem('darkMode') === 'true' ? 'text-white ' : ''}`} >
                        Cancel
                    </button>
                    <button className={props.action === 'delete'? 'btn-danger' : 'btn-primary' } onClick={()=>{props.actionFunction()}}>
                        {props.action || 'Create'}
                    </button>
                </div>
            </div>
        </div>}
    </div>
  )
}

export default ActionPopup
