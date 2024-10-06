import { Link } from "react-router-dom"

const AgendaPage = () => {
  return (
    <div>
      <div className=" lt-sm:flex lt-sm:justify-between lt-sm:items-center">
        <h1>Agenda</h1>
        <Link to="/agenda/grid" className="btn ">Navigate to Grid {'>'}</Link>

      </div>
      
    </div>
  )
}

export default AgendaPage
