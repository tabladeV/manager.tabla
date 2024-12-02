import { Plus } from "lucide-react"

const Messaging = () => {
  return (
    <div className="bg-white flex flex-col h-full items-center rounded-[10px]  p-3 w-full">
      <h2>Messaging</h2>
      <p className="text-center mb-5 mt-2 text-subblack font-[500]">Create and manage your messaging templates <span className="font-[400] text-[#1e1e1e50]">{'(You can add up to 5 templates)'}</span></p>
      <div className=" btn flex flex-col items-center text-center justify-center  cursor-pointer">
        <Plus className="w-10 h-10" />

        <h4>Add a template</h4>
      </div>
    </div>
  )
}

export default Messaging
