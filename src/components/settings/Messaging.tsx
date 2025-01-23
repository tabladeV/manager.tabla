import { set } from "date-fns"
import { Plus, Trash, X } from "lucide-react"
import { useState } from "react"

const Messaging = () => {


  const [templates, setTemplates] = useState([
    {
      id: 1,
      title: 'Reservation Confirmation',
      content: 'Hello, your reservation has been confirmed. We look forward to seeing you soon!',
    },
    {
      id: 2,
      title: 'Reservation Reminder',
      content: 'Hello, just a reminder that you have a reservation with us tomorrow. We look forward to seeing you soon!',
    },
    {
      id: 3,
      title: 'Reservation Cancellation',
      content: 'Hello, your reservation has been cancelled. We hope to see you again soon!',
    }
  ])


  const [trash, setTrash] = useState(false)
  

  const deleteTemplate = (id: number) => {
    setTemplates((prevTemplates) => {
      const newTemplates = prevTemplates.filter((template) => template.id !== id)
      return newTemplates
    })
  }

  const [newTemplateData, setNewTemplateData] = useState([{title:'',content:''}])

  const [newTemplate, setNewTemplate] = useState(false)
  const addTemplate = (title:string,content:string) => {
    setTemplates((prevTemplates) => {
      const newTemplate = {
        id: prevTemplates.length + 1,
        title: title,
        content: content,
      }
      return [...prevTemplates, newTemplate]
    })
    setNewTemplate(false)
  }
  

  return (
    <div className={` flex flex-col h-full items-center rounded-[10px]  p-3 w-full ${localStorage.getItem('darkMode')==='true'?'bg-bgdarktheme':'bg-white'}`}>
      {newTemplate && 
      <div >
        <div className="overlay"/>
        <div className={`sidepopup h-full flex flex-col gap-4 ${localStorage.getItem('darkMode')==='true'?'bg-bgdarktheme':'bg-white'}`}>
          <div className="flex justify-between items-center">
            <h3 className="text-lg">New Template</h3>
            <X onClick={()=>{setNewTemplate(false)}} className={`w-5 h-5 ${localStorage.getItem('darkMode')==='true'?'text-white':'text-black'}`} />
          </div>
          <input 
            type="text" 
            placeholder="Template Title" 
            value={newTemplateData[0].title}
            onChange={(e)=>{setNewTemplateData([{...newTemplateData[0], title: e.target.value}])}} 
            className={`inputs ${localStorage.getItem('darkMode')==='true'?'bg-darkthemeitems':'bg-white'}`} 
          />
          <textarea 
            placeholder="Template Content" 
            value={newTemplateData[0].content}
            onChange={(e)=>{setNewTemplateData([{...newTemplateData[0], content: e.target.value}])}} 
            className={`inputs ${localStorage.getItem('darkMode')==='true'?'bg-darkthemeitems':'bg-white'}`} 
          />
          <button 
            onClick={()=>{addTemplate(newTemplateData[0].title, newTemplateData[0].content)}} 
            className={`btn-primary`}
          >
            Add Template
          </button>
        </div>
      </div>}
      <h2>Messaging</h2>
      <p className={`text-center mb-5 mt-2  font-[500] ${localStorage.getItem('darkMode')==='true'?'text-[#ffffff98]':'text-subblack'} `}>Create and manage your messaging templates <span className={`font-[400] ${localStorage.getItem('darkMode')==='true'?'text-[#ffffff70]':'text-[#1e1e1e50]'}`}>{'(You can add up to 3 templates)'}</span></p>
      {templates.length<3 &&
      <div onClick={()=>{setNewTemplate(true)}} className=" btn flex flex-col items-center text-center justify-center  cursor-pointer">
        <Plus className={`w-10 h-10 ${localStorage.getItem('darkMode')==='true'?'text-white':'text-black'}`} />

        <h4 className={localStorage.getItem('darkMode')==='true'?'text-white':'text-black'}>
          Add a template

        </h4>

      </div>}
      <div className="flex gap-3 w-full">
        {
          templates.map((template) => (
            <div key={template.id} onMouseLeave={()=>{setTrash(false)}} onMouseOver={()=>{setTrash(true)}} className={`flex gap-5 mt-5 w-full h-[5em] items-center justify-between text-center ${localStorage.getItem('darkMode')==='true'?'bg-darkthemeitems':'bg-[#f8f8f8]'} p-3 rounded-[10px]`}>
              <h3 className={``}>{template.title}</h3>
              {trash && <Trash onClick={()=>{deleteTemplate(template.id)}} className={`w-5 h-5 ${localStorage.getItem('darkMode')==='true'?'text-white':'text-black'}`} />}
            </div>
          ))
        }
      </div>
      
    </div>
  )
}

export default Messaging
