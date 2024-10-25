import { MouseEventHandler } from "react";
import { Link, useLocation } from "react-router-dom";

interface AccessToClientProps {
    image: string,
    name: string,
    id: string,
    onClick: MouseEventHandler<HTMLDivElement>;
}



const AccessToClient = (props:AccessToClientProps) => {


  const {pathname} = useLocation();
  return (
    <Link to={`/clients/${props.id}`} className={`flex gap-3 cursor-pointer hover:opacity-80 justify-start bg-softgreytheme rounded-[10px] p-2 items-center ${pathname.includes(props.id)? 'opacity-100':'opacity-25 lt-sm:opacity-100'}`}>
        <img className="w-12 h-12 object-cover rounded-full" src={props.image}/>
        <div className="h-12 border-[1px] border-[#00000010] w-0 "></div>
        <h3 className="text-greytheme">{props.name}</h3>
    </Link>
  )
}

export default AccessToClient
