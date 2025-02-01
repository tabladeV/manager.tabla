import { BaseKey } from "@refinedev/core";
import { url } from "inspector";
import { MouseEventHandler, useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";

interface AccessToClientProps {
    image: string,
    name: string,
    id: BaseKey| undefined,
    onClick: MouseEventHandler<HTMLDivElement>;
    checked?: boolean;
}





const AccessToClient = (props:AccessToClientProps) => {


  const [urlId,setUrlId] = useState('')
  useEffect(() => {
    if (props.id) {
      setUrlId(props.id.toString())
    }
  }, [props.id])
  const {pathname} = useLocation();
  return (
    <div className={ ` rounded-[10px] p-2 flex justify-between items-center ${localStorage.getItem('darkMode')==='true'?'bg-bgdarktheme2 text-white':'bg-softgreytheme text-greytheme'}`}>
      <Link to={`/clients/${props.id}`} className={`flex gap-3 w-full cursor-pointer  hover:opacity-80 justify-start  items-center ${pathname.includes(urlId)? 'opacity-100':'opacity-25 lt-sm:opacity-100'}`}>
        <img className="w-12 h-12 object-cover rounded-full" src={props.image}/>
        <div className="h-12 border-[1px] border-[#00000010] w-0 "></div>
        <h3 className="">{props.name}</h3>
      </Link>
      <input type="checkbox" className="flex checkbox " checked={props.checked} onClick={props.onClick}  />
    </div>
  )
}

export default AccessToClient
