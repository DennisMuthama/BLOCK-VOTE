import React from "react";
import { FaVoteYea, FaUserPlus, FaSignInAlt, FaSignOutAlt } from "react-icons/fa";


const Header = ({ user, onLogout, setShowRegister, setShowLogin }) => {
  return (
    <header className="header-container">
      <div className="header-brand">
        <FaVoteYea className="header-icon" />
        <h1 className="header-title">Blockchain Vote</h1>
      </div>
      
      <div className="header-actions">
        {user ? (
          <>
            <span className="header-greeting">
              <span className="welcome-text">Welcome,</span>
              <span className="username">{user}</span>
            </span>
            <button className="logout-btn" onClick={onLogout}>
              <FaSignOutAlt className="btn-icon" />
              <span>Logout</span>
            </button>
          </>
        ) : (
          <>
            <button
              className="register-btn"
              onClick={() => {
                setShowLogin(false);
                setShowRegister(true);
              }}
            >
              <FaUserPlus className="btn-icon" />
              <span>Register</span>
            </button>
            <button
              className="login-btn"
              onClick={() => {
                setShowRegister(false);
                setShowLogin(true);
              }}
            >
              <FaSignInAlt className="btn-icon" />
              <span>Login</span>
            </button>
          </>
        )}
      </div>
    </header>
  );
};

export default Header;






// import React from "react";


// const Header = ({ user, onLogout, setShowRegister, setShowLogin }) => {
//   return (
//     <header className="header-container">
//       <h1 className="header-title">Voting DApp</h1>
//       <div className="header-actions">
//         {user ? (
//           <>
//             <span className="header-greeting">Hello, {user}</span>
//             <button className="logout-btn" onClick={onLogout}>
//               Logout
//             </button>
//           </>
//         ) : (
//           <>
//             <button
//               className="register-btn"
//               onClick={() => {
//                 setShowLogin(false);
//                 setShowRegister(true);
//               }}
//             >
//               Register
//             </button>
//             <button
//               className="login-btn"
//               onClick={() => {
//                 setShowRegister(false);
//                 setShowLogin(true);
//               }}
//             >
//               Login
//             </button>
//           </>
//         )}
//       </div>
//     </header>
//   );
// };

// export default Header;
