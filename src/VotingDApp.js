import { useEffect, useState } from "react";
import { ethers } from "ethers";
import abi from "./Election.json";
import "./App.css";


function VotingDApp({ user }) {
  const [currentAccount, setCurrentAccount] = useState("");
  const [contract, setContract] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [candidateForm, setCandidateForm] = useState({
    name: "",
    image: "",
    age: "",
    description: "",
  });
  const [editingCandidate, setEditingCandidate] = useState(null);
  const [electionEnded, setElectionEnded] = useState(false);
  const [winner, setWinner] = useState({ name: "", voteCount: 0 });

  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const contractABI = abi.abi;

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
        setCurrentAccount(accounts[0]);
        await loadContract();
      } catch (error) {
        console.error("Error connecting wallet:", error);
      }
    } else {
      alert("Please install MetaMask!");
    }
  };

  const loadContract = async () => {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const electionContract = new ethers.Contract(contractAddress, contractABI, signer);
    setContract(electionContract);

    const adminAddress = await electionContract.admin();
    setIsAdmin(adminAddress.toLowerCase() === (await signer.getAddress()).toLowerCase());

    const ended = await electionContract.electionEnded();
    setElectionEnded(ended);

    await fetchCandidates(electionContract);
    if (ended) await fetchResults(electionContract);
  };

  const fetchCandidates = async (contractInstance) => {
    try {
      const candidatesArray = await contractInstance.getCandidates();
      setCandidates(candidatesArray);
    } catch (error) {
      console.error("Error fetching candidates:", error);
    }
  };

  const addCandidate = async (e) => {
    e.preventDefault();
    try {
      const tx = await contract.addCandidate(
        candidateForm.name,
        candidateForm.image,
        candidateForm.age,
        candidateForm.description
      );
      await tx.wait();
      alert("Candidate added successfully!");
      setCandidateForm({ name: "", image: "", age: "", description: "" });
      await fetchCandidates(contract);
    } catch (error) {
      alert("Error adding candidate: " + error.message);
    }
  };

  const editCandidate = async (e) => {
    e.preventDefault();
    try {
      const tx = await contract.editCandidate(
        editingCandidate.id,
        candidateForm.name,
        candidateForm.image,
        candidateForm.age,
        candidateForm.description
      );
      await tx.wait();
      alert("Candidate edited successfully!");
      setEditingCandidate(null);
      setCandidateForm({ name: "", image: "", age: "", description: "" });
      await fetchCandidates(contract);
    } catch (error) {
      alert("Error editing candidate: " + error.message);
    }
  };

  const removeCandidate = async (candidateId) => {
    if (window.confirm("Are you sure you want to remove this candidate?")) {
      try {
        const tx = await contract.removeCandidate(candidateId);
        await tx.wait();
        alert("Candidate removed successfully!");
        await fetchCandidates(contract);
      } catch (error) {
        alert("Error removing candidate: " + error.message);
      }
    }
  };

  const endElection = async () => {
    if (window.confirm("Are you sure you want to end the election?")) {
      try {
        const tx = await contract.endElection();
        await tx.wait();
        setElectionEnded(true);
        await fetchResults(contract);
        alert("Election ended successfully!");
      } catch (error) {
        alert("Error ending election: " + error.message);
      }
    }
  };

  const startNewElection = async () => {
    if (window.confirm("Start a new election? This will reset candidates.")) {
      try {
        const tx = await contract.startNewElection();
        await tx.wait();
        setElectionEnded(false);
        setWinner({ name: "", voteCount: 0 });
        await fetchCandidates(contract);
        alert("New election started!");
      } catch (error) {
        alert("Error starting new election: " + error.message);
      }
    }
  };

  const voteForCandidate = async (candidateId) => {
    try {
      const tx = await contract.vote(candidateId);
      await tx.wait();
      alert("Vote successful!");
      await fetchCandidates(contract);
    } catch (error) {
      alert("Error voting: " + error.message);
    }
  };

  const fetchResults = async (contractInstance) => {
    try {
      const [winnerName, winnerVoteCount] = await contractInstance.getResults();
      setWinner({ name: winnerName, voteCount: Number(winnerVoteCount) });
    } catch (error) {
      console.error("Error fetching results:", error);
    }
  };

  const startEditing = (candidate) => {
    setEditingCandidate(candidate);
    setCandidateForm({
      name: candidate.name,
      image: candidate.image,
      age: candidate.age.toString(),
      description: candidate.description,
    });
  };

  const cancelEditing = () => {
    setEditingCandidate(null);
    setCandidateForm({ name: "", image: "", age: "", description: "" });
  };

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", () => window.location.reload());
      window.ethereum.on("chainChanged", () => window.location.reload());
    }
  }, []);

  useEffect(() => {
    connectWallet();
  }, []);

  return (
    <div>
      <div className="App">
        {!currentAccount ? (
          <button onClick={connectWallet}>Connect Wallet</button>
        ) : (
          <div>
            <h2>Welcome, {currentAccount}</h2>
            {isAdmin && <h3 style={{ color: "red" }}>ADMIN MODE</h3>}

            {isAdmin && (
              <div className="admin-panel">
                <h2>Admin Panel</h2>
                {!electionEnded ? (
                  <>
                    <h3>{editingCandidate ? "Edit Candidate" : "Add Candidate"}</h3>
                    <form onSubmit={editingCandidate ? editCandidate : addCandidate}>
                      <input
                        type="text"
                        placeholder="Candidate Name"
                        value={candidateForm.name}
                        onChange={(e) =>
                          setCandidateForm({ ...candidateForm, name: e.target.value })
                        }
                        required
                      /><br />
                      <input
                        type="text"
                        placeholder="Image URL"
                        value={candidateForm.image}
                        onChange={(e) =>
                          setCandidateForm({ ...candidateForm, image: e.target.value })
                        }
                        required
                      /><br />
                      <input
                        type="number"
                        placeholder="Age"
                        value={candidateForm.age}
                        onChange={(e) =>
                          setCandidateForm({ ...candidateForm, age: e.target.value })
                        }
                        required
                      /><br />
                      <input
                        type="text"
                        placeholder="Description"
                        value={candidateForm.description}
                        onChange={(e) =>
                          setCandidateForm({ ...candidateForm, description: e.target.value })
                        }
                        required
                      /><br />
                      <button type="submit">
                        {editingCandidate ? "Update Candidate" : "Add Candidate"}
                      </button>
                      {editingCandidate && (
                        <button type="button" onClick={cancelEditing}>
                          Cancel
                        </button>
                      )}
                    </form>
                    <button onClick={endElection} className="end-election-btn">
                      End Election
                    </button>
                  </>
                ) : (
                  <button onClick={startNewElection} className="start-election-btn">
                    Start New Election
                  </button>
                )}
              </div>
            )}

            <h2>{electionEnded ? "Election Results" : "Candidates List"}</h2>

            {electionEnded ? (
              <div className="results">
                <h3>Winner: {winner.name}</h3>
                <p>Total Votes: {winner.voteCount}</p>
              </div>
            ) : (
              <div className="candidates-list">
                {candidates.length > 0 ? (
                  candidates.map((candidate) => (
                    <div key={candidate.id} className="candidate-card">
                      <h3>{candidate.name}</h3>
                      <img src={candidate.image} alt={candidate.name} width="150" />
                      <p>Age: {candidate.age}</p>
                      <p>{candidate.description}</p>
                      <p>Votes: {candidate.voteCount}</p>

                      {!electionEnded && !isAdmin && (
                        <button onClick={() => voteForCandidate(candidate.id)}>Vote</button>
                      )}

                      {isAdmin && !electionEnded && (
                        <div className="admin-actions">
                          <button onClick={() => startEditing(candidate)}>Edit</button>
                          <button onClick={() => removeCandidate(candidate.id)}>Remove</button>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <p>No candidates yet!</p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
   
    </div>
  );
}

export default VotingDApp;









//  //CORRECT CODE 
// import { useEffect, useState } from "react";
// import { ethers } from "ethers";
// import abi from "./Election.json";
// import "./App.css";
// import Header from "./components/Header";
// import Footer from "./components/Footer";

// function VotingDApp({user}) {
//   const [currentAccount, setCurrentAccount] = useState("");
//   const [contract, setContract] = useState(null);
//   const [candidates, setCandidates] = useState([]);
//   const [isAdmin, setIsAdmin] = useState(false);
//   const [candidateForm, setCandidateForm] = useState({
//     name: "",
//     image: "",
//     age: "",
//     description: "",
//   });
//   const [editingCandidate, setEditingCandidate] = useState(null);
//   const [electionEnded, setElectionEnded] = useState(false);
//   const [winner, setWinner] = useState({ name: "", voteCount: 0 });

//   const contractAddress = " 0x4ed7c70F96B99c776995fB64377f0d4aB3B0e1C1";
//   const contractABI = abi.abi;

//   // Connect wallet
//   const connectWallet = async () => {
//     if (window.ethereum) {
//       try {
//         const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
//         setCurrentAccount(accounts[0]);
//         await loadContract();
//       } catch (error) {
//         console.error("Error connecting wallet:", error);
//       }
//     } else {
//       alert("Please install MetaMask!");
//     }
//   };

//   // Load Contract
//   const loadContract = async () => {
//     const provider = new ethers.BrowserProvider(window.ethereum);
//     const signer = await provider.getSigner();
//     const electionContract = new ethers.Contract(contractAddress, contractABI, signer);
//     setContract(electionContract);

//     const adminAddress = await electionContract.admin();
//     setIsAdmin(adminAddress.toLowerCase() === (await signer.getAddress()).toLowerCase());

//     const ended = await electionContract.electionEnded();
//     setElectionEnded(ended);

//     await fetchCandidates(electionContract);
//     if (ended) {
//       await fetchResults(electionContract);
//     }
//   };

//   // Fetch Candidates
//   const fetchCandidates = async (contractInstance) => {
//     try {
//       const candidatesArray = await contractInstance.getCandidates();
//       setCandidates(candidatesArray);
//     } catch (error) {
//       console.error("Error fetching candidates:", error);
//     }
//   };

//   // Add Candidate (Admin only)
//   const addCandidate = async (e) => {
//     e.preventDefault();
//     try {
//       const tx = await contract.addCandidate(
//         candidateForm.name,
//         candidateForm.image,
//         candidateForm.age,
//         candidateForm.description
//       );
//       await tx.wait();
//       alert("Candidate added successfully!");
//       setCandidateForm({ name: "", image: "", age: "", description: "" });
//       await fetchCandidates(contract);
//     } catch (error) {
//       console.error("Error adding candidate:", error);
//       alert("Error adding candidate: " + error.message);
//     }
//   };

//   // Edit Candidate (Admin only)
//   const editCandidate = async (e) => {
//     e.preventDefault();
//     try {
//       const tx = await contract.editCandidate(
//         editingCandidate.id,
//         candidateForm.name,
//         candidateForm.image,
//         candidateForm.age,
//         candidateForm.description
//       );
//       await tx.wait();
//       alert("Candidate edited successfully!");
//       setEditingCandidate(null);
//       setCandidateForm({ name: "", image: "", age: "", description: "" });
//       await fetchCandidates(contract);
//     } catch (error) {
//       console.error("Error editing candidate:", error);
//       alert("Error editing candidate: " + error.message);
//     }
//   };

//   // Remove Candidate (Admin only)
//   const removeCandidate = async (candidateId) => {
//     if (window.confirm("Are you sure you want to remove this candidate?")) {
//       try {
//         const tx = await contract.removeCandidate(candidateId);
//         await tx.wait();
//         alert("Candidate removed successfully!");
//         await fetchCandidates(contract);
//       } catch (error) {
//         console.error("Error removing candidate:", error);
//         alert("Error removing candidate: " + error.message);
//       }
//     }
//   };

//   // End Election (Admin only)
//   const endElection = async () => {
//     if (window.confirm("Are you sure you want to end the election? This cannot be undone.")) {
//       try {
//         const tx = await contract.endElection();
//         await tx.wait();
//         setElectionEnded(true);
//         await fetchResults(contract);
//         alert("Election ended successfully!");
//       } catch (error) {
//         console.error("Error ending election:", error);
//         alert("Error ending election: " + error.message);
//       }
//     }
//   };

//   // Start New Election (Admin only)
//   const startNewElection = async () => {
//     if (window.confirm("Are you sure you want to start a new election? This will clear all current candidates.")) {
//       try {
//         const tx = await contract.startNewElection();
//         await tx.wait();
//         setElectionEnded(false);
//         setWinner({ name: "", voteCount: 0 });
//         await fetchCandidates(contract);
//         alert("New election started!");
//       } catch (error) {
//         console.error("Error starting new election:", error);
//         alert("Error starting new election: " + error.message);
//       }
//     }
//   };

//   // Vote
//   const voteForCandidate = async (candidateId) => {
//     try {
//       const tx = await contract.vote(candidateId);
//       await tx.wait();
//       alert("Vote successful!");
//       await fetchCandidates(contract);
//     } catch (error) {
//       console.error("Error voting:", error);
//       alert("Error voting: " + error.message);
//     }
//   };

//   // Fetch Results
//   const fetchResults = async (contractInstance) => {
//     try {
//       const [winnerName, winnerVoteCount] = await contractInstance.getResults();
//       setWinner({ name: winnerName, voteCount: Number(winnerVoteCount) });
//     } catch (error) {
//       console.error("Error fetching results:", error);
//     }
//   };

//   // Start editing a candidate
//   const startEditing = (candidate) => {
//     setEditingCandidate(candidate);
//     setCandidateForm({
//       name: candidate.name,
//       image: candidate.image,
//       age: candidate.age.toString(),
//       description: candidate.description,
//     });
//   };

//   // Cancel editing
//   const cancelEditing = () => {
//     setEditingCandidate(null);
//     setCandidateForm({ name: "", image: "", age: "", description: "" });
//   };

//   // Listen to account changes
//   useEffect(() => {
//     if (window.ethereum) {
//       window.ethereum.on("accountsChanged", () => {
//         window.location.reload();
//       });

//       window.ethereum.on("chainChanged", () => {
//         window.location.reload();
//       });
//     }
//   }, []);

//   // On initial load
//   useEffect(() => {
//     connectWallet();
//   }, []);

// const App = ({ user }) => {
//   return (
//   <div>
//     <Header/>
//     <div className="App">
//       {!currentAccount ? (
//         <button onClick={connectWallet}>Connect Wallet</button>
//       ) : (
//         <div>
//           <h2>Welcome, {currentAccount}</h2>
//           {isAdmin && <h3 style={{ color: "red" }}>ADMIN MODE</h3>}
          
//           {isAdmin && (
//             <div className="admin-panel">
//               <h2>Admin Panel</h2>
//               {!electionEnded ? (
//                 <>
//                   <h3>{editingCandidate ? "Edit Candidate" : "Add Candidate"}</h3>
//                   <form onSubmit={editingCandidate ? editCandidate : addCandidate}>
//                     <input
//                       type="text"
//                       placeholder="Candidate Name"
//                       value={candidateForm.name}
//                       onChange={(e) => setCandidateForm({ ...candidateForm, name: e.target.value })}
//                       required
//                     /><br />
//                     <input
//                       type="text"
//                       placeholder="Image URL"
//                       value={candidateForm.image}
//                       onChange={(e) => setCandidateForm({ ...candidateForm, image: e.target.value })}
//                       required
//                     /><br />
//                     <input
//                       type="number"
//                       placeholder="Age"
//                       value={candidateForm.age}
//                       onChange={(e) => setCandidateForm({ ...candidateForm, age: e.target.value })}
//                       required
//                     /><br />
//                     <input
//                       type="text"
//                       placeholder="Description"
//                       value={candidateForm.description}
//                       onChange={(e) => setCandidateForm({ ...candidateForm, description: e.target.value })}
//                       required
//                     /><br />
//                     <button type="submit">
//                       {editingCandidate ? "Update Candidate" : "Add Candidate"}
//                     </button>
//                     {editingCandidate && (
//                       <button type="button" onClick={cancelEditing}>
//                         Cancel
//                       </button>
//                     )}
//                   </form>
//                   <button onClick={endElection} className="end-election-btn">
//                     End Election
//                   </button>
//                 </>
//               ) : (
//                 <button onClick={startNewElection} className="start-election-btn">
//                   Start New Election
//                 </button>
//               )}
//             </div>
//           )}

//           <h2>{electionEnded ? "Election Results" : "Candidates List"}</h2>
          
//           {electionEnded ? (
//             <div className="results">
//               <h3>Winner: {winner.name}</h3>
//               <p>Total Votes: {winner.voteCount}</p>
//             </div>
//           ) : (
//             <div className="candidates-list">
//               {candidates.length > 0 ? (
//                 candidates.map((candidate) => (
//                   <div key={candidate.id} className="candidate-card">
//                     <h3>{candidate.name}</h3>
//                     <img src={candidate.image} alt={candidate.name} width="150" />
//                     <p>Age: {candidate.age}</p>
//                     <p>{candidate.description}</p>
//                     <p>Votes: {candidate.voteCount}</p>
                    
//                     {!electionEnded && !isAdmin && (
//                       <button onClick={() => voteForCandidate(candidate.id)}>Vote</button>
//                     )}
                    
//                     {isAdmin && !electionEnded && (
//                       <div className="admin-actions">
//                         <button onClick={() => startEditing(candidate)}>Edit</button>
//                         <button onClick={() => removeCandidate(candidate.id)}>Remove</button>
//                       </div>
//                     )}
//                   </div>
//                 ))
//               ) : (
//                 <p>No candidates yet!</p>
//               )}
//             </div>
//           )}
//         </div>
//       )}
//     </div>
//     <Footer/>
// </div>
//   );
// }
// }

// export default VotingDApp;









































































































































































































































// //CODE 2
// import { useEffect, useState } from "react";
// import { ethers } from "ethers";
// import abi from "./Election.json";
// import "./App.css";

// function App() {
//   const [currentAccount, setCurrentAccount] = useState("");
//   const [contract, setContract] = useState(null);
//   const [candidates, setCandidates] = useState([]);
//   const [isAdmin, setIsAdmin] = useState(false);
//   const [candidateForm, setCandidateForm] = useState({
//     name: "",
//     image: "",
//     age: "",
//     description: "",
//   });
//   const [electionEnded, setElectionEnded] = useState(false);
//   const [winner, setWinner] = useState({ name: "", voteCount: 0 });

//   const contractAddress = "0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9"; 
//   const contractABI = abi.abi;

//   // Connect wallet
//   const connectWallet = async () => {
//     if (window.ethereum) {
//       try {
//         const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
//         setCurrentAccount(accounts[0]);
//         await loadContract();
//       } catch (error) {
//         console.error("Error connecting wallet:", error);
//       }
//     } else {
//       alert("Please install MetaMask!");
//     }
//   };

//   // Load Contract
//   const loadContract = async () => {
//     const provider = new ethers.BrowserProvider(window.ethereum);
//     const signer = await provider.getSigner();
//     const electionContract = new ethers.Contract(contractAddress, contractABI, signer);
//     setContract(electionContract);

//     const adminAddress = await electionContract.admin();
//     setIsAdmin(adminAddress.toLowerCase() === (await signer.getAddress()).toLowerCase());

//     const ended = await electionContract.electionEnded();
//     setElectionEnded(ended);

//     await fetchCandidates(electionContract);
//     if (ended) {
//       await fetchResults(electionContract);
//     }
//   };

//   // Fetch Candidates
//   const fetchCandidates = async (contractInstance) => {
//     try {
//       const candidatesArray = await contractInstance.getCandidates();
//       setCandidates(candidatesArray);
//     } catch (error) {
//       console.error("Error fetching candidates:", error);
//     }
//   };

//   // Add Candidate (Admin only)
//   const addCandidate = async (e) => {
//     e.preventDefault();
//     try {
//       const tx = await contract.addCandidate(
//         candidateForm.name,
//         candidateForm.image,
//         candidateForm.age,
//         candidateForm.description
//       );
//       await tx.wait();
//       alert("Candidate added successfully!");
//       setCandidateForm({ name: "", image: "", age: "", description: "" });
//       await fetchCandidates(contract);
//     } catch (error) {
//       console.error("Error adding candidate:", error);
//     }
//   };

//   // Vote
//   const voteForCandidate = async (candidateId) => {
//     try {
//       const tx = await contract.vote(candidateId);
//       await tx.wait();
//       alert("Vote successful!");
//       await fetchCandidates(contract);
//     } catch (error) {
//       console.error("Error voting:", error);
//       alert("Error voting. Maybe you already voted or the election ended.");
//     }
//   };

//   // Fetch Results
//   const fetchResults = async (contractInstance) => {
//     try {
//       const [winnerName, winnerVoteCount] = await contractInstance.getResults();
//       setWinner({ name: winnerName, voteCount: winnerVoteCount });
//     } catch (error) {
//       console.error("Error fetching results:", error);
//     }
//   };

//   // Listen to account changes
//   useEffect(() => {
//     if (window.ethereum) {
//       window.ethereum.on("accountsChanged", () => {
//         window.location.reload();
//       });

//       window.ethereum.on("chainChanged", () => {
//         window.location.reload();
//       });
//     }
//   }, []);

//   // On initial load
//   useEffect(() => {
//     connectWallet();
//   }, []);

//   return (
//     <div className="App">
//       {!currentAccount ? (
//         <button onClick={connectWallet}>Connect Wallet</button>
//       ) : (
//         <div>
//           <h2>Welcome, {currentAccount}</h2>
//           {isAdmin ? (
//             <>
//               <h2>Admin Panel - Add Candidate</h2>
//               <form onSubmit={addCandidate}>
//                 <input
//                   type="text"
//                   placeholder="Candidate Name"
//                   value={candidateForm.name}
//                   onChange={(e) => setCandidateForm({ ...candidateForm, name: e.target.value })}
//                   required
//                 /><br />
                
//                 <input
//                   type="text"
//                   placeholder="Image URL"
//                   value={candidateForm.image}
//                   onChange={(e) => setCandidateForm({ ...candidateForm, image: e.target.value })}
//                   required
//                 /><br />
//                 <input
//                   type="number"
//                   placeholder="Age"
//                   value={candidateForm.age}
//                   onChange={(e) => setCandidateForm({ ...candidateForm, age: e.target.value })}
//                   required
//                 /><br />
//                 <input
//                   type="text"
//                   placeholder="Description"
//                   value={candidateForm.description}
//                   onChange={(e) => setCandidateForm({ ...candidateForm, description: e.target.value })}
//                   required
//                 /><br />
//                 <button type="submit">Add Candidate</button>
//               </form>
//             </>
//           ) : (
//             <>
//               <h2>Voter Panel - Candidates List</h2>
//               {!electionEnded ? (
//                 candidates.length > 0 ? (
//                   candidates.map((candidate) => (
//                     <div key={candidate.id} className="candidate-card">
//                       <h3>{candidate.name}</h3>
//                       <img src={candidate.image} alt={candidate.name} width="150" />
//                       <p>Age: {candidate.age}</p>
//                       <p>{candidate.description}</p>
//                       <p>Votes: {candidate.voteCount}</p>
//                       <button onClick={() => voteForCandidate(candidate.id)}>Vote</button>
//                     </div>
//                   ))
//                 ) : (
//                   <p>No candidates yet!</p>
//                 )
//               ) : (
//                 <div>
//                   <h2>Election Ended</h2>
//                   <h3>Winner: {winner.name}</h3>
//                   <p>Votes: {winner.voteCount}</p>
//                 </div>
//               )}
//             </>
//           )}
//         </div>
//       )}
//     </div>

//   );
// }

// export default App;












//code 3
// import { useEffect, useState } from "react";
// import { ethers } from "ethers";
// import { useCallback } from 'react';
// import abi from "./Election.json";
// import "./App.css";

// function App() {
//   const [currentAccount, setCurrentAccount] = useState("");
//   const [contract, setContract] = useState(null);
//   const [candidates, setCandidates] = useState([]);
//   const [isAdmin, setIsAdmin] = useState(false);
//   const [candidateForm, setCandidateForm] = useState({
//     name: "",
//     image: "",
//     age: "",
//     description: ""
//   });
//   const [editCandidateId, setEditCandidateId] = useState(null);
//   const [electionEnded, setElectionEnded] = useState(false);
//   const [winner, setWinner] = useState({ name: "", voteCount: 0 });

//   const contractAddress = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";
//   const contractABI = abi.abi;

//   const connectWallet = useCallback(async () => {
//     if (!window.ethereum) return alert("Install MetaMask first.");
//     try {
//       // const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
//       const provider = new ethers.BrowserProvider(window.ethereum);
//       const signer = await provider.getSigner();
//       const electionContract = new ethers.Contract(contractAddress, contractABI, signer);

//       const admin = await electionContract.admin();
//       const current = await signer.getAddress();

//       setCurrentAccount(current);
//       setContract(electionContract);
//       setIsAdmin(admin.toLowerCase() === current.toLowerCase());

//       const ended = await electionContract.electionEnded();
//       setElectionEnded(ended);

//       await fetchCandidates(electionContract);
//       if (ended) await fetchResults(electionContract);
//     } catch (err) {
//       console.error("Wallet connection error:", err);
//     }
//   }, [contractABI, contractAddress]);

//   const fetchCandidates = async (contractInstance) => {
//     try {
//       const data = await contractInstance.getCandidates();
//       setCandidates(data);
//     } catch (err) {
//       console.error("Error fetching candidates:", err);
//     }
//   };

//   const addCandidate = async (e) => {
//     e.preventDefault();
//     try {
//       if (editCandidateId !== null) {
//         const tx = await contract.editCandidate(
//           editCandidateId,
//           candidateForm.name,
//           candidateForm.image,
//           candidateForm.age,
//           candidateForm.description
//         );
//         await tx.wait();
//         alert("Candidate updated");
//         setEditCandidateId(null);
//       } else {
//         const tx = await contract.addCandidate(
//           candidateForm.name,
//           candidateForm.image,
//           candidateForm.age,
//           candidateForm.description
//         );
//         await tx.wait();
//         alert("Candidate added");
//       }
//       setCandidateForm({ name: "", image: "", age: "", description: "" });
//       await fetchCandidates(contract);
//     } catch (err) {
//       console.error("Candidate add/edit failed:", err);
//     }
//   };

//   const removeCandidate = async (id) => {
//     if (!window.confirm("Remove this candidate?")) return;
//     try {
//       const tx = await contract.removeCandidate(id);
//       await tx.wait();
//       alert("Candidate removed");
//       await fetchCandidates(contract);
//     } catch (err) {
//       console.error("Remove failed:", err);
//     }
//   };

//   const startEditCandidate = (c) => {
//     setCandidateForm({
//       name: c.name,
//       image: c.image,
//       age: c.age,
//       description: c.description,
//     });
//     setEditCandidateId(c.id);
//   };

//   const voteForCandidate = async (id) => {
//     try {
//       const tx = await contract.vote(id);
//       await tx.wait();
//       alert("Vote casted!");
//       await fetchCandidates(contract);
//     } catch (err) {
//       alert("Voting failed. You might have already voted.");
//       console.error("Vote failed:", err);
//     }
//   };

//   const endElection = async () => {
//     if (!window.confirm("End the election?")) return;
//     try {
//       const tx = await contract.endElection();
//       await tx.wait();
//       alert("Election ended");
//       setElectionEnded(true);
//       await fetchResults(contract);
//     } catch (err) {
//       console.error("Ending failed:", err);
//     }
//   };

//   const startNewElection = async () => {
//     try {
//       const tx = await contract.startNewElection();
//       await tx.wait();
//       alert("New election started");
//       setElectionEnded(false);
//       setCandidates([]);
//     } catch (err) {
//       alert("Error starting new election");
//       console.error(err);
//     }
//   };

//   const fetchResults = async (contractInstance) => {
//     try {
//       const [winnerName, voteCount] = await contractInstance.getResults();
//       setWinner({ name: winnerName, voteCount: Number(voteCount) });
//     } catch (err) {
//       console.error("Result fetch failed:", err);
//     }
//   };

//   // Watch for MetaMask account/network changes
//   useEffect(() => {
//     if (window.ethereum) {
//       window.ethereum.on("accountsChanged", () => window.location.reload());
//       window.ethereum.on("chainChanged", () => window.location.reload());
//     }
//   }, []);

//   useEffect(() => {
//     connectWallet();
//   }, [connectWallet]);
  
//   return (
//     <div>
  
//       <div className="App">
//         {!currentAccount ? (
//           <button onClick={connectWallet}>Connect Wallet</button>
//         ) : (
//           <>
//             <h3>Connected as: {currentAccount}</h3>

//             {isAdmin ? (
//               <div>
//                 <h2>Admin Panel</h2>
//                 <form onSubmit={addCandidate}>
//                   <input placeholder="Name" value={candidateForm.name} onChange={e => setCandidateForm({ ...candidateForm, name: e.target.value })} required /><br />
//                   <input placeholder="Image URL" value={candidateForm.image} onChange={e => setCandidateForm({ ...candidateForm, image: e.target.value })} required /><br />
//                   <input type="number" placeholder="Age" value={candidateForm.age} onChange={e => setCandidateForm({ ...candidateForm, age: e.target.value })} required /><br />
//                   <input placeholder="Description" value={candidateForm.description} onChange={e => setCandidateForm({ ...candidateForm, description: e.target.value })} required /><br />
//                   <button type="submit">{editCandidateId !== null ? "Update" : "Add"} Candidate</button>
//                 </form>

//                 {!electionEnded ? (
//                   <button onClick={endElection} style={{ background: "red", color: "white", marginTop: 10 }}>End Election</button>
//                 ) : (
//                   <button onClick={startNewElection} style={{ background: "green", color: "white", marginTop: 10 }}>Start New Election</button>
//                 )}

//                 <h3>Candidates</h3>
//                 {candidates.length > 0 ? candidates.map(c => (
//                   <div key={c.id} className="candidate-card">
//                     <h4>{c.name}</h4>
//                     <img src={c.image} alt={c.name} width="150" />
//                     <p>Age: {c.age}</p>
//                     <p>{c.description}</p>
//                     <p>Votes: {c.voteCount}</p>
//                     {!electionEnded && (
//                       <>
//                         <button onClick={() => startEditCandidate(c)}>Edit</button>
//                         <button onClick={() => removeCandidate(c.id)}>Remove</button>
//                       </>
//                     )}
//                   </div>
//                 )) : <p>No candidates yet</p>}
//               </div>
//             ) : (
//               <div>
//                 <h2>Voter Panel</h2>
//                 {!electionEnded ? (
//                   candidates.length > 0 ? candidates.map(c => (
//                     <div key={c.id} className="candidate-card">
//                       <h4>{c.name}</h4>
//                       <img src={c.image} alt={c.name} width="150" />
//                       <p>Age: {c.age}</p>
//                       <p>{c.description}</p>
//                       <p>Votes: {c.voteCount}</p>
//                       <button onClick={() => voteForCandidate(c.id)}>Vote</button>
//                     </div>
//                   )) : <p>No candidates yet</p>
//                 ) : (
//                   <div>
//                     <h3>Election Ended</h3>
//                     <h4>Winner: {winner.name}</h4>
//                     <p>Total Votes: {winner.voteCount}</p>
//                   </div>
//                 )}
//               </div>
//             )}
//           </>
//         )}
//       </div>
  
//     </div>
//   );
// }

// export default App;


// import { useEffect, useState } from "react";
// import { ethers } from "ethers";
// import abi from "./Election.json";
// import "./App.css";
// import Header from "./Header";
// import Footer from "./Footer";
// // import Register from "./components/Register";
// // import Login from "./components/Login";


// function App() {
//   const [currentAccount, setCurrentAccount] = useState("");
//   const [contract, setContract] = useState(null);
//   const [candidates, setCandidates] = useState([]);
//   const [isAdmin, setIsAdmin] = useState(false);
//   const [candidateForm, setCandidateForm] = useState({
//     name: "",
//     image: "",
//     age: "",
//     description: ""
//   });
//   const [editCandidateId, setEditCandidateId] = useState(null);
//   const [electionEnded, setElectionEnded] = useState(false);
//   const [winner, setWinner] = useState({ name: "", voteCount: 0 });

//   const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
//   const contractABI = abi.abi;

//   // Connect wallet
//   const connectWallet = async () => {
//     if (window.ethereum) {
//       try {
//         const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
//         setCurrentAccount(accounts[0]);
//         await loadContract();
//       } catch (error) {
//         console.error("Error connecting wallet:", error);
//       }
//     } else {
//       alert("Please install MetaMask!");
//     }
//   };

//   // Load contract
//   const loadContract = async () => {
//     const provider = new ethers.BrowserProvider(window.ethereum);
//     const signer = await provider.getSigner();
//     const electionContract = new ethers.Contract(contractAddress, contractABI, signer);
//     setContract(electionContract);

//     const adminAddress = await electionContract.admin();
//     setIsAdmin(adminAddress.toLowerCase() === (await signer.getAddress()).toLowerCase());

//     const ended = await electionContract.electionEnded();
//     setElectionEnded(ended);

//     await fetchCandidates(electionContract);
//     if (ended) {
//       await fetchResults(electionContract);
//     }
//   };

//   // Fetch candidates
//   const fetchCandidates = async (contractInstance) => {
//     try {
//       const candidatesArray = await contractInstance.getCandidates();
//       setCandidates(candidatesArray);
//     } catch (error) {
//       console.error("Error fetching candidates:", error);
//     }
//   };

//   // Add or edit candidate
//   const addCandidate = async (e) => {
//     e.preventDefault();
//     try {
//       if (editCandidateId) {
//         const tx = await contract.editCandidate(
//           editCandidateId,
//           candidateForm.name,
//           candidateForm.image,
//           candidateForm.age,
//           candidateForm.description
//         );
//         await tx.wait();
//         alert("Candidate edited successfully!");
//         setEditCandidateId(null);
//       } else {
//         const tx = await contract.addCandidate(
//           candidateForm.name,
//           candidateForm.image,
//           candidateForm.age,
//           candidateForm.description
//         );
//         await tx.wait();
//         alert("Candidate added successfully!");
//       }
//       setCandidateForm({ name: "", image: "", age: "", description: "" });
//       await fetchCandidates(contract);
//     } catch (error) {
//       console.error("Error adding/editing candidate:", error);
//     }
//   };

//   // Start editing candidate
//   const startEditCandidate = (candidate) => {
//     setCandidateForm({
//       name: candidate.name,
//       image: candidate.image,
//       age: candidate.age,
//       description: candidate.description,
//     });
//     setEditCandidateId(candidate.id);
//   };

//   // Remove candidate
//   const removeCandidate = async (candidateId) => {
//     try {
//       const confirm = window.confirm("Are you sure you want to remove this candidate?");
//       if (!confirm) return;
//       const tx = await contract.removeCandidate(candidateId);
//       await tx.wait();
//       alert("Candidate removed successfully!");
//       await fetchCandidates(contract);
//     } catch (error) {
//       console.error("Error removing candidate:", error);
//     }
//   };

//   // Vote for candidate
//   const voteForCandidate = async (candidateId) => {
//     try {
//       const tx = await contract.vote(candidateId);
//       await tx.wait();
//       alert("Vote successful!");
//       await fetchCandidates(contract);
//     } catch (error) {
//       console.error("Error voting:", error);
//       alert("Error voting. Maybe you already voted or the election ended.");
//     }
//   };

//   // End election
//   const endElection = async () => {
//     try {
//       const confirm = window.confirm("Are you sure you want to end the election?");
//       if (!confirm) return;
//       const tx = await contract.endElection();
//       await tx.wait();
//       alert("Election ended!");
//       setElectionEnded(true);
//       await fetchResults(contract);
//     } catch (error) {
//       console.error("Error ending election:", error);
//     }
//   };

//   // Fetch results
//   const fetchResults = async (contractInstance) => {
//     try {
//       const [winnerName, winnerVoteCount] = await contractInstance.getResults();
//       setWinner({ name: winnerName, voteCount: Number(winnerVoteCount) });
//     } catch (error) {
//       console.error("Error fetching results:", error);
//     }
//   };

//   // Start new election
//   const startNewElection = async () => {
//     try {
//       const tx = await contract.startNewElection();
//       await tx.wait();
//       alert("New election started! You can now add new candidates.");
//       setElectionEnded(false);
//       setCandidates([]);
//     } catch (error) {
//       console.error("Error starting new election:", error);
//       alert("Error starting new election.");
//     }
//   };

//   // Listen to account and chain changes
//   useEffect(() => {
//     if (window.ethereum) {
//       window.ethereum.on("accountsChanged", () => {
//         window.location.reload();
//       });
//       window.ethereum.on("chainChanged", () => {
//         window.location.reload();
//       });
//     }
//   }, []);

//   // Initial connection
//   useEffect(() => {
//     connectWallet();
//   }, []);

//   return (
//     <div>
//       <Header/>
//     <div className="App">
//       {!currentAccount ? (
//         <button onClick={connectWallet}>Connect Wallet</button>
//       ) : (
//         <div>
//           <h2>Welcome, {currentAccount}</h2>

//           {isAdmin ? (
//             <div>
//               <h2>Admin Panel</h2>
//               <form onSubmit={addCandidate}>
//                 <input
//                   type="text"
//                   placeholder="Candidate Name"
//                   value={candidateForm.name}
//                   onChange={(e) => setCandidateForm({ ...candidateForm, name: e.target.value })}
//                   required
//                 /><br />
//                 <input
//                   type="text"
//                   placeholder="Image URL"
//                   value={candidateForm.image}
//                   onChange={(e) => setCandidateForm({ ...candidateForm, image: e.target.value })}
//                   required
//                 /><br />
//                 <input
//                   type="number"
//                   placeholder="Age"
//                   value={candidateForm.age}
//                   onChange={(e) => setCandidateForm({ ...candidateForm, age: e.target.value })}
//                   required
//                 /><br />
//                 <input
//                   type="text"
//                   placeholder="Description"
//                   value={candidateForm.description}
//                   onChange={(e) => setCandidateForm({ ...candidateForm, description: e.target.value })}
//                   required
//                 /><br />
//                 <button type="submit">{editCandidateId ? "Edit Candidate" : "Add Candidate"}</button>
//               </form>

//               {!electionEnded && (
//                 <button
//                   className="end-election-btn"
//                   onClick={endElection}
//                   style={{ backgroundColor: "red", color: "white", marginTop: "10px" }}
//                 >
//                   End Election
//                 </button>
//               )}

//               {electionEnded && (
//                 <button
//                   className="start-new-election-btn"
//                   onClick={startNewElection}
//                   style={{ backgroundColor: "green", color: "white", marginTop: "10px" }}
//                 >
//                   Start New Election
//                 </button>
//               )}

//               <h2>Candidates List</h2>
//               {candidates.length > 0 ? (
//                 candidates.map((candidate) => (
//                   <div key={candidate.id} className="candidate-card">
//                     <h3>{candidate.name}</h3>
//                     <img src={candidate.image} alt={candidate.name} width="150" />
//                     <p>Age: {candidate.age}</p>
//                     <p>{candidate.description}</p>
//                     <p>Votes: {candidate.voteCount}</p>
//                     {!electionEnded && (
//                       <>
//                         <button className="edit-btn" onClick={() => startEditCandidate(candidate)}>Edit</button>
//                         <button className="remove-btn" onClick={() => removeCandidate(candidate.id)}>Remove</button>
//                       </>
//                     )}
//                   </div>
//                 ))
//               ) : (
//                 <p>No candidates yet!</p>
//               )}
//             </div>
//           ) : (
//             <div>
//               <h2>Voter Panel - Candidates List</h2>
//               {!electionEnded ? (
//                 candidates.length > 0 ? (
//                   candidates.map((candidate) => (
//                     <div key={candidate.id} className="candidate-card">
//                       <h3>{candidate.name}</h3>
//                       <img src={candidate.image} alt={candidate.name} width="150" />
//                       <p>Age: {candidate.age}</p>
//                       <p>{candidate.description}</p>
//                       <p>Votes: {candidate.voteCount}</p>
//                       <button onClick={() => voteForCandidate(candidate.id)}>Vote</button>
//                     </div>
//                   ))
//                 ) : (
//                   <p>No candidates yet!</p>
//                 )
//               ) : (
//                 <div>
//                   <h2>Election Ended</h2>
//                   <h3>Winner: {winner.name}</h3>
//                   <p>Votes: {winner.voteCount}</p>
//                 </div>
//               )}
//             </div>
//           )}
//         </div>
//       )}
//     </div>
//     <Footer/>
//     </div>
//   );
// }

// export default App; 








































// //CODE 2
// import { useEffect, useState } from "react";
// import { ethers } from "ethers";
// import abi from "./Election.json";
// import "./App.css";

// function App() {
//   const [currentAccount, setCurrentAccount] = useState("");
//   const [contract, setContract] = useState(null);
//   const [candidates, setCandidates] = useState([]);
//   const [isAdmin, setIsAdmin] = useState(false);
//   const [candidateForm, setCandidateForm] = useState({
//     name: "",
//     image: "",
//     age: "",
//     description: "",
//   });
//   const [electionEnded, setElectionEnded] = useState(false);
//   const [winner, setWinner] = useState({ name: "", voteCount: 0 });

//   const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; 
//   const contractABI = abi.abi;

//   // Connect wallet
//   const connectWallet = async () => {
//     if (window.ethereum) {
//       try {
//         const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
//         setCurrentAccount(accounts[0]);
//         await loadContract();
//       } catch (error) {
//         console.error("Error connecting wallet:", error);
//       }
//     } else {
//       alert("Please install MetaMask!");
//     }
//   };

//   // Load Contract
//   const loadContract = async () => {
//     const provider = new ethers.BrowserProvider(window.ethereum);
//     const signer = await provider.getSigner();
//     const electionContract = new ethers.Contract(contractAddress, contractABI, signer);
//     setContract(electionContract);

//     const adminAddress = await electionContract.admin();
//     setIsAdmin(adminAddress.toLowerCase() === (await signer.getAddress()).toLowerCase());

//     const ended = await electionContract.electionEnded();
//     setElectionEnded(ended);

//     await fetchCandidates(electionContract);
//     if (ended) {
//       await fetchResults(electionContract);
//     }
//   };

//   // Fetch Candidates
//   const fetchCandidates = async (contractInstance) => {
//     try {
//       const candidatesArray = await contractInstance.getCandidates();
//       setCandidates(candidatesArray);
//     } catch (error) {
//       console.error("Error fetching candidates:", error);
//     }
//   };

//   // Add Candidate (Admin only)
//   const addCandidate = async (e) => {
//     e.preventDefault();
//     try {
//       const tx = await contract.addCandidate(
//         candidateForm.name,
//         candidateForm.image,
//         candidateForm.age,
//         candidateForm.description
//       );
//       await tx.wait();
//       alert("Candidate added successfully!");
//       setCandidateForm({ name: "", image: "", age: "", description: "" });
//       await fetchCandidates(contract);
//     } catch (error) {
//       console.error("Error adding candidate:", error);
//     }
//   };

//   // Vote
//   const voteForCandidate = async (candidateId) => {
//     try {
//       const tx = await contract.vote(candidateId);
//       await tx.wait();
//       alert("Vote successful!");
//       await fetchCandidates(contract);
//     } catch (error) {
//       console.error("Error voting:", error);
//       alert("Error voting. Maybe you already voted or the election ended.");
//     }
//   };

//   // Fetch Results
//   const fetchResults = async (contractInstance) => {
//     try {
//       const [winnerName, winnerVoteCount] = await contractInstance.getResults();
//       setWinner({ name: winnerName, voteCount: winnerVoteCount });
//     } catch (error) {
//       console.error("Error fetching results:", error);
//     }
//   };

//   // Listen to account changes
//   useEffect(() => {
//     if (window.ethereum) {
//       window.ethereum.on("accountsChanged", () => {
//         window.location.reload();
//       });

//       window.ethereum.on("chainChanged", () => {
//         window.location.reload();
//       });
//     }
//   }, []);

//   // On initial load
//   useEffect(() => {
//     connectWallet();
//   }, []);

//   return (
//     <div className="App">
//       {!currentAccount ? (
//         <button onClick={connectWallet}>Connect Wallet</button>
//       ) : (
//         <div>
//           <h2>Welcome, {currentAccount}</h2>
//           {isAdmin ? (
//             <>
//               <h2>Admin Panel - Add Candidate</h2>
//               <form onSubmit={addCandidate}>
//                 <input
//                   type="text"
//                   placeholder="Candidate Name"
//                   value={candidateForm.name}
//                   onChange={(e) => setCandidateForm({ ...candidateForm, name: e.target.value })}
//                   required
//                 /><br />
                
//                 <input
//                   type="text"
//                   placeholder="Image URL"
//                   value={candidateForm.image}
//                   onChange={(e) => setCandidateForm({ ...candidateForm, image: e.target.value })}
//                   required
//                 /><br />
//                 <input
//                   type="number"
//                   placeholder="Age"
//                   value={candidateForm.age}
//                   onChange={(e) => setCandidateForm({ ...candidateForm, age: e.target.value })}
//                   required
//                 /><br />
//                 <input
//                   type="text"
//                   placeholder="Description"
//                   value={candidateForm.description}
//                   onChange={(e) => setCandidateForm({ ...candidateForm, description: e.target.value })}
//                   required
//                 /><br />
//                 <button type="submit">Add Candidate</button>
//               </form>
//             </>
//           ) : (
//             <>
//               <h2>Voter Panel - Candidates List</h2>
//               {!electionEnded ? (
//                 candidates.length > 0 ? (
//                   candidates.map((candidate) => (
//                     <div key={candidate.id} className="candidate-card">
//                       <h3>{candidate.name}</h3>
//                       <img src={candidate.image} alt={candidate.name} width="150" />
//                       <p>Age: {candidate.age}</p>
//                       <p>{candidate.description}</p>
//                       <p>Votes: {candidate.voteCount}</p>
//                       <button onClick={() => voteForCandidate(candidate.id)}>Vote</button>
//                     </div>
//                   ))
//                 ) : (
//                   <p>No candidates yet!</p>
//                 )
//               ) : (
//                 <div>
//                   <h2>Election Ended</h2>
//                   <h3>Winner: {winner.name}</h3>
//                   <p>Votes: {winner.voteCount}</p>
//                 </div>
//               )}
//             </>
//           )}
//         </div>
//       )}
//     </div>
//   );
// }

// export default App;



// import { useEffect, useState } from "react";
// import { ethers } from "ethers";
// import abi from "./Election.json";
// import "./App.css";

// function App() {
//   const [candidates, setCandidates] = useState([]);
//   const [currentAccount, setCurrentAccount] = useState("");
//   const [name, setName] = useState("");
//   const [image, setImage] = useState("");
//   const [age, setAge] = useState("");
//   const [description, setDescription] = useState("");
//   const [contract, setContract] = useState(null);
//   const [candidateDetails, setCandidateDetails] = useState({});
//   const [electionEnded, setElectionEnded] = useState(false);

//   const contractAddress = "0x2279B7A0a67DB372996a5FaB50D91eAA73d2eBe6"; // Replace with your own contract address
//   const contractABI = abi.abi;

//   useEffect(() => {
//     connectWallet();
//     loadContract();
//   }, []);

//   const connectWallet = async () => {
//     if (window.ethereum) {
//       const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
//       setCurrentAccount(accounts[0]);
//     } else {
//       alert("Please install MetaMask");
//     }
//   };

//   const loadContract = async () => {
//     if (typeof window.ethereum !== "undefined") {
//       try {
//         const provider = new ethers.BrowserProvider(window.ethereum);
//         await provider.send("eth_requestAccounts", []);
//         const signer = await provider.getSigner();
//         const electionContract = new ethers.Contract(contractAddress, contractABI, signer);
//         setContract(electionContract);
//         fetchCandidates(electionContract);
//         checkElectionStatus(electionContract);
//       } catch (error) {
//         console.error("Error loading contract:", error);
//         alert("Error connecting to wallet: " + (error.message || error));
//       }
//     } else {
//       alert("Please install MetaMask!");
//     }
//   };

//   const checkElectionStatus = async (electionContract) => {
//     const ended = await electionContract.electionEnded();
//     setElectionEnded(ended);
//   };

//   const fetchCandidates = async (electionContract) => {
//     const candidatesArray = [];
//     const candidatesExtraInfo = {};
//     const candidatesCount = await electionContract.candidatesCount();

//     for (let i = 1; i <= candidatesCount; i++) {
//       const candidate = await electionContract.getCandidate(i);
//       candidatesArray.push(candidate);

//       // For demo purposes, we assume extra info manually for now
//       candidatesExtraInfo[candidate.id] = {
//         image: "https://via.placeholder.com/150",
//         age: 30 + i, // random age
//         description: `Candidate slogan ${i}`,
//       };
//     }
//     setCandidates(candidatesArray);
//     setCandidateDetails(candidatesExtraInfo);
//   };

//   const handleVote = async (id) => {
//     try {
//       const tx = await contract.vote(id);
//       await tx.wait();
//       fetchCandidates(contract);
//       alert("Voted successfully!");
//     } catch (error) {
//       alert("You might have already voted or error occurred!");
//       console.error(error);
//     }
//   };

//   const addCandidate = async () => {
//     if (!name || !image || !age || !description) {
//       alert("Please fill in all fields!");
//       return;
//     }
//     try {
//       const tx = await contract.addCandidate(name, image, age, description);
//       await tx.wait();

//       const newCandidateId = candidates.length + 1; // Assumes sequential IDs
//       setCandidateDetails({
//         ...candidateDetails,
//         [newCandidateId]: {
//           image: image,
//           age: age,
//           description: description,
//         },
//       });

//       setName("");
//       setImage("");
//       setAge("");
//       setDescription("");

//       fetchCandidates(contract);
//       alert("Candidate added successfully!");
//     } catch (error) {
//       console.error(error);
//       alert("Only admin can add candidates!");
//     }
//   };

//   return (
//     <div className="App">
//       <h1>Election Voting DApp 🗳️</h1>

//       {currentAccount ? (
//         <>
//           {currentAccount.toLowerCase() === "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266".toLowerCase() ? (
//             <div>
//               <h2>Add Candidate</h2>
//               <input
//                 type="text"
//                 placeholder="Candidate Name"
//                 value={name}
//                 onChange={(e) => setName(e.target.value)}
//               /><br />
//               <input
//                 type="text"
//                 placeholder="Candidate Image URL"
//                 value={image}
//                 onChange={(e) => setImage(e.target.value)}
//               /><br />
//               <input
//                 type="number"
//                 placeholder="Candidate Age"
//                 value={age}
//                 onChange={(e) => setAge(e.target.value)}
//               /><br />
//               <input
//                 type="text"
//                 placeholder="Candidate Description/Slogan"
//                 value={description}
//                 onChange={(e) => setDescription(e.target.value)}
//               /><br />
//               <button onClick={addCandidate}>Add Candidate</button>
//             </div>
//           ) : (
//             <h3>Welcome voter! You can now cast your vote!</h3>
//           )}

//           <h2>Candidate List</h2>
//           {candidates.map((candidate) => {
//             const details = candidateDetails[candidate.id] || {};
//             return (
//               <div key={candidate.id} style={{ marginBottom: "20px", border: "1px solid #ddd", padding: "10px", borderRadius: "10px" }}>
//                 {details.image && (
//                   <img
//                     src={details.image}
//                     alt="Candidate"
//                     width="150"
//                     height="150"
//                     style={{ borderRadius: "10px" }}
//                   />
//                 )}
//                 <h3>{candidate.name}</h3>
//                 {details.age && <p><strong>Age:</strong> {details.age}</p>}
//                 {details.description && <p><strong>Slogan:</strong> {details.description}</p>}
//                 <p><strong>Votes:</strong> {candidate.voteCount.toString()}</p>
//                 <button onClick={() => handleVote(candidate.id)} disabled={electionEnded}>Vote</button>
//               </div>
//             );
//           })}

//           {electionEnded && (
//             <div>
//               <h2>Election Results</h2>
//               {candidates.map((candidate) => (
//                 <div key={candidate.id}>
//                   <h3>{candidate.name}</h3>
//                   <p><strong>Votes:</strong> {candidate.voteCount}</p>
//                 </div>
//               ))}
//               <p><strong>The winner is:</strong> {candidates.reduce((max, candidate) => candidate.voteCount > max.voteCount ? candidate : max, candidates[0]).name}</p>
//             </div>
//           )}
//         </>
//       ) : (
//         <button onClick={connectWallet}>Connect Wallet</button>
//       )}
//     </div>
//   );
// }

// export default App;














// import { useEffect, useState } from "react";
// import { ethers } from "ethers";
// import abi from "./Election.json";
// import "./App.css";

// function App() {
//   const [candidates, setCandidates] = useState([]);
//   const [currentAccount, setCurrentAccount] = useState("");
//   const [name, setName] = useState("");
//   const [image, setImage] = useState("");
//   const [age, setAge] = useState("");
//   const [description, setDescription] = useState("");
//   const [contract, setContract] = useState(null);
//   const [candidateDetails, setCandidateDetails] = useState({});

//   const contractAddress = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0"; // Replace with your own contract address
//   const contractABI = abi.abi;

//   useEffect(() => {
//     connectWallet();
//     loadContract();
//   }, []);

//   const connectWallet = async () => {
//     if (window.ethereum) {
//       const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
//       setCurrentAccount(accounts[0]);
//     } else {
//       alert("Please install MetaMask");
//     }
//   };

//   const loadContract = async () => {
//     if (typeof window.ethereum !== "undefined") {
//       try {
//         const provider = new ethers.BrowserProvider(window.ethereum);
//         await provider.send("eth_requestAccounts", []);
//         const signer = await provider.getSigner();
//         const electionContract = new ethers.Contract(contractAddress, contractABI, signer);
//         setContract(electionContract);
//         fetchCandidates(electionContract);
//       } catch (error) {
//         console.error("Error loading contract:", error);
//         alert("Error connecting to wallet: " + (error.message || error));
//       }
//     } else {
//       alert("Please install MetaMask!");
//     }
//   };

//   const fetchCandidates = async (electionContract) => {
//     const candidatesArray = [];
//     const candidatesExtraInfo = {};
//     const candidatesCount = await electionContract.candidatesCount();

//     for (let i = 1; i <= candidatesCount; i++) {
//       const candidate = await electionContract.getCandidate(i);
//       candidatesArray.push(candidate);

//       // For demo purposes, we assume extra info manually for now
//       candidatesExtraInfo[candidate.id] = {
//         image: "https://via.placeholder.com/150",
//         age: 30 + i, // random age
//         description: `Candidate slogan ${i}`,
//       };
//     }
//     setCandidates(candidatesArray);
//     setCandidateDetails(candidatesExtraInfo);
//   };

//   const handleVote = async (id) => {
//     try {
//       const tx = await contract.vote(id);
//       await tx.wait();
//       fetchCandidates(contract);
//       alert("Voted successfully!");
//     } catch (error) {
//       alert("You might have already voted or error occurred!");
//       console.error(error);
//     }
//   };

//   const addCandidate = async () => {
//     if (!name || !image || !age || !description) {
//       alert("Please fill in all fields!");
//       return;
//     }
//     try {
//       const tx = await contract.addCandidate(name);
//       await tx.wait();

//       const newCandidateId = candidates.length + 1; // Assumes sequential IDs
//       setCandidateDetails({
//         ...candidateDetails,
//         [newCandidateId]: {
//           image: image,
//           age: age,
//           description: description,
//         },
//       });

//       setName("");
//       setImage("");
//       setAge("");
//       setDescription("");

//       fetchCandidates(contract);
//       alert("Candidate added successfully!");
//     } catch (error) {
//       console.error(error);
//       alert("Only admin can add candidates!");
//     }
//   };

//   return (
//     <div className="App">
//       <h1>Election Voting DApp 🗳️</h1>

//       {currentAccount ? (
//         <>
//           {currentAccount.toLowerCase() === "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266".toLowerCase() ? (
//             <div>
//               <h2>Add Candidate</h2>
//               <input
//                 type="text"
//                 placeholder="Candidate Name"
//                 value={name}
//                 onChange={(e) => setName(e.target.value)}
//               /><br />
//               <input
//                 type="text"
//                 placeholder="Candidate Image URL"
//                 value={image}
//                 onChange={(e) => setImage(e.target.value)}
//               /><br />
//               <input
//                 type="number"
//                 placeholder="Candidate Age"
//                 value={age}
//                 onChange={(e) => setAge(e.target.value)}
//               /><br />
//               <input
//                 type="text"
//                 placeholder="Candidate Description/Slogan"
//                 value={description}
//                 onChange={(e) => setDescription(e.target.value)}
//               /><br />
//               <button onClick={addCandidate}>Add Candidate</button>
//             </div>
//           ) : (
//             <h3>Welcome voter! You can now cast your vote!</h3>
//           )}

//           <h2>Candidate List</h2>
//           {candidates.map((candidate) => {
//             const details = candidateDetails[candidate.id] || {};
//             return (
//               <div key={candidate.id} style={{ marginBottom: "20px", border: "1px solid #ddd", padding: "10px", borderRadius: "10px" }}>
//                 {details.image && (
//                   <img
//                     src={details.image}
//                     alt="Candidate"
//                     width="150"
//                     height="150"
//                     style={{ borderRadius: "10px" }}
//                   />
//                 )}
//                 <h3>{candidate.name}</h3>
//                 {details.age && <p><strong>Age:</strong> {details.age}</p>}
//                 {details.description && <p><strong>Slogan:</strong> {details.description}</p>}
//                 <p><strong>Votes:</strong> {candidate.voteCount.toString()}</p>
//                 <button onClick={() => handleVote(candidate.id)}>Vote</button>
//               </div>
//             );
//           })}
//         </>
//       ) : (
//         <button onClick={connectWallet}>Connect Wallet</button>
//       )}
//     </div>
//   );
// }

// export default App;
// import { useEffect, useState } from "react";
// import { ethers } from "ethers";
// import abi from "./Election.json";
// import './App.css';

// function App() {
//   const [candidates, setCandidates] = useState([]);
//   const [currentAccount, setCurrentAccount] = useState("");
//   const [name, setName] = useState("");
//   const [contract, setContract] = useState(null);

//   const contractAddress = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0"; // replace here
//   const contractABI = abi.abi;

//   useEffect(() => {
//     connectWallet();
//     loadContract();
//   }, []);

//   const connectWallet = async () => {
//     if (window.ethereum) {
//       const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
//       setCurrentAccount(accounts[0]);
//     } else {
//       alert("Install MetaMask");
//     }
//   };

//   async function loadContract() {
//     if (typeof window.ethereum !== 'undefined') {
//       try {
//         const provider = new ethers.BrowserProvider(window.ethereum);
//         await provider.send("eth_requestAccounts", []); // Ask Metamask to connect
//         const signer = await provider.getSigner();
//         const electionContract = new ethers.Contract(contractAddress, contractABI, signer);
//         setContract(electionContract);
//         fetchCandidates(electionContract);
//       } catch (error) {
//         console.error("Error loading contract:", error);
//         alert("Error connecting to wallet: " + (error.message || error));
//       }
//     } else {
//       alert('Please install Metamask!');
//     }
//   }

//   const fetchCandidates = async (electionContract) => {
//     const candidatesArray = [];
//     const candidatesCount = await electionContract.candidatesCount();

//     for (let i = 1; i <= candidatesCount; i++) {
//       const candidate = await electionContract.getCandidate(i);
//       candidatesArray.push(candidate);
//     }
//     setCandidates(candidatesArray);
//   };

//   const handleVote = async (id) => {
//     try {
//       const tx = await contract.vote(id);
//       await tx.wait();
//       fetchCandidates(contract);
//       alert("Voted successfully!");
//     } catch (error) {
//       alert("You might have already voted or an error occurred!");
//       console.error(error);
//     }
//   };

//   const addCandidate = async () => {
//     try {
//       const tx = await contract.addCandidate(name);
//       await tx.wait();
//       fetchCandidates(contract);
//       setName("");
//       alert("Candidate added!");
//     } catch (error) {
//       console.error(error);
//       alert("Only admin can add candidates!");
//     }
//   };

//   return (
//     <div className="App">
//       <h1>Election Voting DApp 🗳️</h1>

//       {currentAccount ? (
//         <>
//           <div>
//             <h2>Add Candidate</h2>
//             <input
//               placeholder="Candidate name"
//               value={name}
//               onChange={(e) => setName(e.target.value)}
//             />
//             <button onClick={addCandidate}>Add</button>
//           </div>

//           <h2>Candidates List</h2>
//           {candidates.map((candidate, index) => (
//             <div key={index} style={{ marginBottom: "20px", border: "1px solid #ddd", padding: "10px" }}>
//               <h3>{candidate.name}</h3>
//               <p>Votes: {candidate.voteCount.toString()}</p>
//               <button onClick={() => handleVote(candidate.id)}>Vote</button>
//             </div>
//           ))}
//         </>
//       ) : (
//         <button onClick={connectWallet}>Connect Wallet</button>
//       )}
//     </div>
//   );
// }

// export default App;
