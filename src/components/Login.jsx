import React, { useState } from "react";

const Login = ({ onLogin }) => {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    const storedUser = JSON.parse(localStorage.getItem("user"));

    if (
      storedUser &&
      storedUser.name === name &&
      storedUser.password === password
    ) {
      onLogin(name);
    } else {
      alert("Invalid username or password");
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl mb-2">Login</h2>
      <input
        className="border p-2 mr-2"
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      /><br></br>
      <input
        className="border p-2 mr-2"
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      /><br></br>
      <button className="bg-green-500 text-white p-2" onClick={handleLogin}>
        Login
      </button>
    </div>
  );
};

export default Login;

