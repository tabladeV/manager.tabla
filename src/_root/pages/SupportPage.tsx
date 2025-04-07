import { Contact, ContactIcon, FileQuestion } from "lucide-react"
import { useState } from "react"
import { Link } from "react-router-dom"

const SupportPage = () => {

  const [showMail, setShowMail] = useState(false)
  return (
    <div className="text-center">
      <h1 >Support Page</h1>
      <p className="text-lg">How can we help you today?</p>
      <div className="flex gap-4 justify-center mt-[10vh]">
        <Link to="/faq" className="flex p-6 flex-col text-xl btn-secondary w-[20vw] items-center justify-center gap-2"> 
          <FileQuestion size={30} />
          FAQ
        </Link>
        <div onClick={()=>{setShowMail(true)}} className="flex cursor-pointer p-6 flex-col text-xl btn-secondary w-[20vw] items-center justify-center gap-2">
          <ContactIcon size={30} />
          Contact Tabla
        </div>

      </div>

      {showMail && 
      <div className="flex flex-col gap-4 items-center mt-10 text-lg">
        <p className="text-center font-[600]" >
          contact us at:
        </p>
        <a href="mailto:contact@tabla.ma" className="btn-primary ">
          contact@tabla.ma
        </a>
      </div>}
    </div>
  )
}

export default SupportPage
