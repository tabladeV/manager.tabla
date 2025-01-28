import Logo from "../../components/header/Logo"
import Cookies from "js-cookie";
import logo from '../../assets/logo.png'



const LogIn = () => {

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const username = (e.currentTarget[0] as HTMLInputElement).value;
    const password = (e.currentTarget[1] as HTMLInputElement).value;
    window.location.href = "/";
    console.log(username, password);
    const token = btoa(`${username}:${password}`);
    Cookies.set("token", token, { expires: 1 });
    // Call the API to log in
    // If successful, redirect to the main page
    // If not, show an error message
  }
  if (Cookies.get("token")) {
    window.location.href = "/";
  }

  

  return (
    <div className={`flex bg-cover overflow-hidden flex-col items-center w-full h-screen justify-center bg-softgreentheme `}>
      <Logo className="horizontal"/>
      <h1 className="text-4xl font-bold text-center text-darkthemeitems ">
        Welcome to Tabla.ma Admin
      </h1>
      <p className="text-center text-subblack">
        Log in to your account to continue
      </p>
      <form  className="flex flex-col  gap-2 mt-8" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Username"
          className="inputs-unique w-[30vw]"
        />
        <input
          type="password"
          placeholder="Password"
          className="inputs-unique w-[30vw]"
        />
        <button  className="btn-primary w-[30vw]">Log In</button>
      </form>
      <div>
        <img src={logo} alt="logo" className="w-[60em] absolute h-[60em] blur-xl top-[-30em] z-[-10] left-[-20em] opacity-10" />
      </div>
    </div>
  )
}

export default LogIn
