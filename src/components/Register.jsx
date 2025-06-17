import React, { useState } from "react";
import Footer from "./Footer";

const Register = () => {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = () => {
    if (!name || !password) {
      alert("All fields are required.");
      return;
    }

    const user = { name, password };
    localStorage.setItem("user", JSON.stringify(user));
    alert("Registration successful! You can now log in.");
    setName("");
    setPassword("");
  };

  return (
    <div className="p-4">
      <h2 className="text-xl mb-2">Register</h2>
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
      <button className="bg-blue-500 text-white p-2" onClick={handleRegister}>
        Register
      </button>
    </div>
 
  );
};

export default Register;
