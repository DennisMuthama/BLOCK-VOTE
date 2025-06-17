import React, { useState, useEffect } from "react";
import Header from "./components/Header";
import Login from "./components/Login";
import Register from "./components/Register";
import VotingDApp from "./VotingDApp";
import Footer from "./components/Footer";

const Main = () => {
  const [user, setUser] = useState(null);
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  useEffect(() => {
    const loggedInUser = localStorage.getItem("loggedInUser");
    if (loggedInUser) setUser(loggedInUser);
  }, []);

  const handleLogin = (username) => {
    localStorage.setItem("loggedInUser", username);
    setUser(username);
    setShowLogin(false);
    setShowRegister(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("loggedInUser");
    setUser(null);
  };

  return (
<div>
<div className="app-container">
      <Header
        user={user}
        onLogout={handleLogout}
        setShowLogin={setShowLogin}
        setShowRegister={setShowRegister}
      />

      {user ? (
        <VotingDApp user={user} />
      ) : (
        <div className="p-4">
          {showLogin && <Login onLogin={handleLogin} />}
          {showRegister && (
            <Register
              setShowLogin={setShowLogin}
              setShowRegister={setShowRegister}
            />
          )}
          {!showLogin && !showRegister && (
            <p className="text-gray-700">Please log in or register to use the DApp.</p>
          )}
        </div>
      )}
    </div>
    <p>







    </p>
    <Footer/>
    </div>
  );
};

export default Main;



// import React, { useState, useEffect } from "react";
// import Header from "./components/Header";
// import Login from "./components/Login";
// import Register from "./components/Register";
// import VotingDApp from "./VotingDApp"; // This is the actual voting DApp

// const Main = () => {
//   const [user, setUser] = useState(null);
//   const [showLogin, setShowLogin] = useState(false);
//   const [showRegister, setShowRegister] = useState(false);

//   useEffect(() => {
//     const loggedInUser = localStorage.getItem("loggedInUser");
//     if (loggedInUser) setUser(loggedInUser);
//   }, []);

//   const handleLogin = (username) => {
//     localStorage.setItem("loggedInUser", username);
//     setUser(username);
//     setShowLogin(false);
//     setShowRegister(false);
//   };

//   const handleLogout = () => {
//     localStorage.removeItem("loggedInUser");
//     setUser(null);
//   };

//   return (
//     <div>
//       <Header
//         user={user}
//         onLogout={handleLogout}
//         setShowLogin={setShowLogin}
//         setShowRegister={setShowRegister}
//       />

//       {user ? (
//         <VotingDApp user={user} />
//       ) : (
//         <div className="p-4">
//           {showLogin && <Login onLogin={handleLogin} />}
//           {showRegister && <Register />}
//           {!showLogin && !showRegister && (
//             <p className="text-gray-700">Please log in or register to use the DApp.</p>
//           )}
//         </div>
//       )}
//     </div>
//   );
// };

// export default Main;
