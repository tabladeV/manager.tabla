import { useState } from 'react';
import logo from '../../assets/logo.png';
import { ca } from 'date-fns/locale';

const ReviewPage = () => {
  const [step, setStep] = useState(1);

  const [brightService, setBrightService] = useState(0);
  const [brightAmbiance, setBrightAmbiance] = useState(0);
  const [brightFood, setBrightFood] = useState(0);
  const [brightValueForMoney, setBrightValueForMoney] = useState(0);
  
  const [email, setEmail] = useState('');
  const [reviewText, setReviewText] = useState('');

  const renderStars = (count: number, activeCount: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className="cursor-pointer" onClick={() => setStep(i + 1)}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={`h-6 w-6 ${i < activeCount ? 'text-yellow-500' : 'text-gray-300'}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
          />
        </svg>
      </span>
    ));
  };

  const handleBrightness = (num: number, category: 'ambiance' | 'service' | 'food'| 'valueForMoney') => {
    category === 'ambiance' && setBrightAmbiance(num);
    category === 'service' && setBrightService(num);
    category === 'food' && setBrightFood(num);
    category === 'valueForMoney' && setBrightValueForMoney(num);

  };

  const [reviewData, setReviewData] = useState({
    email: '',
    service: 0,
    ambiance: 0,
    food: 0,
    valueForMoney: 0,
    reviewText: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    setReviewData({
      ...reviewData,
      email,
      service: brightService,
      ambiance: brightAmbiance,
      food: brightFood,
      valueForMoney: brightValueForMoney,
      reviewText,
    });
    
    
    setStep(2);
  };
  console.log(reviewData);

  return (
    <div className="text-center flex flex-col items-center overflow-y-scroll justify-center h-screen">
      <img
        src="https://www.darelkaid.ma/wp-content/uploads/2023/02/Logo_Dar_El_Kaid-Transp.png"
        alt="logo"
        className="w-[8em]"
      />
      <img
        src="https://www.darelkaid.ma/wp-content/uploads/2023/02/Logo_Dar_El_Kaid-Transp.png"
        alt="logo"
        className="z-[-10] w-[50em] blur-md opacity-30 left-[-10em] top-[-10em] absolute"
      />
      
      <h1 className={`text-3xl font-bold mt-3 text-darkthemeitems ${step === 1 ? 'block' : 'hidden'}`}>
        Thank you for visiting us! <br />
      </h1>

      <p className={`w-[50%] lt-sm:w-[90%] text-subblack mt-3 ${step===1 ? 'block':'hidden'}`}>
        Gorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam eu turpis molestie, dictum est a, mattis tellus. Sed dignissim.
      </p>

      {step===1 && <form onSubmit={handleSubmit} className="flex flex-col gap-3 items-center lg:w-[40%] w-[60%]  lt-sm:w-[90%] mt-3">
        {/* <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={` bg-white p-3 rounded-md shadow-2xl border-[0px] shadow-[#88AB6120] w-full lt-sm:w-[90%] inputs-unique mt-3 `}
          placeholder="Email"
          required
        /> */}
        <div className='grid grid-cols-2 gap-3 justify-between w-full lt-sm:w-[90%] bg-white p-3 rounded-md shadow-2xl shadow-[#88AB6120]'>
          <div className="flex font-[500] gap-3 items-center">Service</div>
          <div className="flex items-center gap-4">
            {[1, 2, 3, 4, 5].map((star) => (
              <div
                key={`service-${star}`}
                className="cursor-pointer"
                onClick={() => handleBrightness(star, 'service')}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M9.44341 17.4783L5.11528 19.8562C4.53065 20.1774 3.80756 19.9425 3.5002 19.3316C3.37781 19.0883 3.33558 18.8096 3.38004 18.5387L4.20664 13.5023C4.27317 13.0969 4.14455 12.6833 3.86269 12.3961L0.361159 8.82936C-0.111814 8.34758 -0.121491 7.55634 0.339542 7.06208C0.523129 6.86526 0.763681 6.73717 1.02396 6.69765L5.86296 5.96285C6.25249 5.9037 6.58922 5.64804 6.76342 5.27918L8.92749 0.69694C9.2198 0.0779898 9.93691 -0.176136 10.5292 0.129334C10.7651 0.250974 10.956 0.450471 11.0724 0.69694L13.2364 5.27918C13.4106 5.64804 13.7474 5.9037 14.1369 5.96285L18.9759 6.69765C19.6295 6.7969 20.0824 7.43109 19.9874 8.11414C19.9496 8.38613 19.827 8.63751 19.6387 8.82936L16.1372 12.3961C15.8553 12.6833 15.7267 13.0969 15.7932 13.5023L16.6198 18.5387C16.7315 19.219 16.2942 19.8651 15.6433 19.9818C15.384 20.0282 15.1174 19.9841 14.8846 19.8562L10.5564 17.4783C10.208 17.2869 9.79181 17.2869 9.44341 17.4783Z"
                    fill={brightService >= star ? "#F6B93B" : "#D9D9D9"}
                  />
                </svg>
              </div>
            ))}
          </div>
          <div className="flex font-[500] gap-3 items-center">Ambiance</div>
          <div className="flex items-center gap-4">
            {[1, 2, 3, 4, 5].map((star) => (
              <div
                key={`ambiance-${star}`}
                className="cursor-pointer"
                onClick={() => handleBrightness(star, 'ambiance')}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M9.44341 17.4783L5.11528 19.8562C4.53065 20.1774 3.80756 19.9425 3.5002 19.3316C3.37781 19.0883 3.33558 18.8096 3.38004 18.5387L4.20664 13.5023C4.27317 13.0969 4.14455 12.6833 3.86269 12.3961L0.361159 8.82936C-0.111814 8.34758 -0.121491 7.55634 0.339542 7.06208C0.523129 6.86526 0.763681 6.73717 1.02396 6.69765L5.86296 5.96285C6.25249 5.9037 6.58922 5.64804 6.76342 5.27918L8.92749 0.69694C9.2198 0.0779898 9.93691 -0.176136 10.5292 0.129334C10.7651 0.250974 10.956 0.450471 11.0724 0.69694L13.2364 5.27918C13.4106 5.64804 13.7474 5.9037 14.1369 5.96285L18.9759 6.69765C19.6295 6.7969 20.0824 7.43109 19.9874 8.11414C19.9496 8.38613 19.827 8.63751 19.6387 8.82936L16.1372 12.3961C15.8553 12.6833 15.7267 13.0969 15.7932 13.5023L16.6198 18.5387C16.7315 19.219 16.2942 19.8651 15.6433 19.9818C15.384 20.0282 15.1174 19.9841 14.8846 19.8562L10.5564 17.4783C10.208 17.2869 9.79181 17.2869 9.44341 17.4783Z"
                    fill={brightAmbiance >= star ? "#F6B93B" : "#D9D9D9"}
                  />
                </svg>
              </div>
            ))}
          </div>
          <div className="flex font-[500] gap-3 items-center">Food</div>
          <div className="flex items-center gap-4">
            {[1, 2, 3, 4, 5].map((star) => (
              <div
                key={`ambiance-${star}`}
                className="cursor-pointer"
                onClick={() => handleBrightness(star, 'food')}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M9.44341 17.4783L5.11528 19.8562C4.53065 20.1774 3.80756 19.9425 3.5002 19.3316C3.37781 19.0883 3.33558 18.8096 3.38004 18.5387L4.20664 13.5023C4.27317 13.0969 4.14455 12.6833 3.86269 12.3961L0.361159 8.82936C-0.111814 8.34758 -0.121491 7.55634 0.339542 7.06208C0.523129 6.86526 0.763681 6.73717 1.02396 6.69765L5.86296 5.96285C6.25249 5.9037 6.58922 5.64804 6.76342 5.27918L8.92749 0.69694C9.2198 0.0779898 9.93691 -0.176136 10.5292 0.129334C10.7651 0.250974 10.956 0.450471 11.0724 0.69694L13.2364 5.27918C13.4106 5.64804 13.7474 5.9037 14.1369 5.96285L18.9759 6.69765C19.6295 6.7969 20.0824 7.43109 19.9874 8.11414C19.9496 8.38613 19.827 8.63751 19.6387 8.82936L16.1372 12.3961C15.8553 12.6833 15.7267 13.0969 15.7932 13.5023L16.6198 18.5387C16.7315 19.219 16.2942 19.8651 15.6433 19.9818C15.384 20.0282 15.1174 19.9841 14.8846 19.8562L10.5564 17.4783C10.208 17.2869 9.79181 17.2869 9.44341 17.4783Z"
                    fill={brightFood >= star ? "#F6B93B" : "#D9D9D9"}
                  />
                </svg>
              </div>
            ))}
          </div>

          <div className="flex font-[500] gap-3 items-center">Value for money</div>
          <div className="flex items-center gap-4">
            {[1, 2, 3, 4, 5].map((star) => (
              <div
                key={`ambiance-${star}`}
                className="cursor-pointer"
                onClick={() => handleBrightness(star, 'valueForMoney')}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M9.44341 17.4783L5.11528 19.8562C4.53065 20.1774 3.80756 19.9425 3.5002 19.3316C3.37781 19.0883 3.33558 18.8096 3.38004 18.5387L4.20664 13.5023C4.27317 13.0969 4.14455 12.6833 3.86269 12.3961L0.361159 8.82936C-0.111814 8.34758 -0.121491 7.55634 0.339542 7.06208C0.523129 6.86526 0.763681 6.73717 1.02396 6.69765L5.86296 5.96285C6.25249 5.9037 6.58922 5.64804 6.76342 5.27918L8.92749 0.69694C9.2198 0.0779898 9.93691 -0.176136 10.5292 0.129334C10.7651 0.250974 10.956 0.450471 11.0724 0.69694L13.2364 5.27918C13.4106 5.64804 13.7474 5.9037 14.1369 5.96285L18.9759 6.69765C19.6295 6.7969 20.0824 7.43109 19.9874 8.11414C19.9496 8.38613 19.827 8.63751 19.6387 8.82936L16.1372 12.3961C15.8553 12.6833 15.7267 13.0969 15.7932 13.5023L16.6198 18.5387C16.7315 19.219 16.2942 19.8651 15.6433 19.9818C15.384 20.0282 15.1174 19.9841 14.8846 19.8562L10.5564 17.4783C10.208 17.2869 9.79181 17.2869 9.44341 17.4783Z"
                    fill={brightValueForMoney >= star ? "#F6B93B" : "#D9D9D9"}
                  />
                </svg>
              </div>
            ))}
          </div>
        </div>
        <textarea
          value={reviewText}
          onChange={(e) => setReviewText(e.target.value)}
          className="bg-white p-3 rounded-md shadow-2xl shadow-[#88AB6120] w-full lt-sm:w-[90%] h-[6em] inputs-unique"
          placeholder="Write your review here"
          required
        />

        <button type="submit" className="btn-primary mt-3">
          Send
        </button>
      </form>}
      {
        step === 2 &&
        <div className="flex flex-col gap-3 items-center lg:w-[40%] w-[60%]  lt-sm:w-[90%] mt-3">
          <h2 className="text-2xl font-bold text-darkthemeitems">Thank you for your review!</h2>
          <p className="text-subblack">
            Your review has been submitted successfully. We appreciate your feedback.
          </p>
        </div>
      }
    </div>
  );
};

export default ReviewPage;