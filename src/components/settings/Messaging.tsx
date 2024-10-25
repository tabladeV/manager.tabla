
const Messaging = () => {
  return (
    <div className="bg-white flex flex-col items-center rounded-[10px]  p-3 w-full">
      <h2>Messaging</h2>
      <form className="flex flex-col gap-3 sm:w-[60%] mt-3">
        <div className="flex flex-col gap-1">
          <h4>Reservations</h4>
          <input type="email" id="email" placeholder="Subject" className="inputs" />
          <textarea
            id="description"
            placeholder="Message"
            className="inputs w-full"
            rows={5}
          ></textarea>
        </div>
        <div className="flex flex-col gap-1">
          <h4>Offers</h4>
          <input type="email" id="email" placeholder="Subject" className="inputs" />
          <textarea
            id="description"
            placeholder="Message"
            className="inputs w-full"
            rows={5}
          ></textarea>
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
