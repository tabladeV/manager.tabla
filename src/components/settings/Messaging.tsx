
const Messaging = () => {
  return (
    <div className="bg-white rounded-[10px] p-3 w-full">
      <h2>Messaging</h2>
      <form className="flex flex-col gap-3">
        <div className="flex flex-row gap-3  ">
            <input type="text" id="name" placeholder="Restaurant Name" className="inputs" />
            <input type="text" id="email" placeholder="Email" className="inputs" />
        </div>
        <div className="flex gap-3">
          <textarea id="description" placeholder="Restaurant Description" className="inputs w-full"></textarea>
        </div>
        <div className="flex flex-row gap-3">
            <input type="text" id="phone" placeholder="Phone" className="inputs" />
            <input type="text" id="website" placeholder="Website" className="inputs" />
        </div>
        <div className="flex w-full justify-center gap-4 ">
          <button type='reset' className="btn">Cancel</button>
          <button type="submit" className="btn-primary">Save</button>
        </div>
      </form>
    </div>
  )
}

export default Messaging
