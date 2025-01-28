import { Contact, ContactIcon, FileQuestion } from "lucide-react"
import { Link } from "react-router-dom"

const SupportPage = () => {
  return (
    <div className="text-center">
      <h1 >Support Page</h1>
      <p className="text-lg">How can we help you today?</p>
      <div className="flex gap-4 justify-center mt-[10vh]">
        <Link to="/support/faq" className="flex p-6 flex-col text-xl btn-secondary w-[20vw] items-center justify-center gap-2"> 
          <FileQuestion size={30} />
          FAQ
        </Link>
        <Link to="/support/contact" className="flex p-6 flex-col text-xl btn-secondary w-[20vw] items-center justify-center gap-2">
          <ContactIcon size={30} />
          Contact Tabla
        </Link>
      </div>
    </div>
  )
}

export default SupportPage
