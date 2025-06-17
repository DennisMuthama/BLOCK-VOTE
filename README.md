# Voting DApp
## 📚 Project Overview
Voting DApp is a decentralized application (DApp) that allows for secure and transparent voting powered by Solidity smart contracts, deployed with Hardhat, and integrated with React.
Voting is performed by Metamask wallet approval for transactions.
The DApp lets admins add candidates, voters vote for their preferred candidate, and the admin end the election and view the final results afterwards.

## 🔹Features
Add Candidates: The admin (contract owner) can add candidates before the election starts.

Voting: Voters can vote for their preferred candidate by signing a transaction through MetaMask.

One voter = One vote: Each voter can vote only once.

Close Election: The admin can close the election, after which the results are displayed to everyone.

## 🛡 Tech Stack
Solidity

Hardhat

React

MetaMask

Ether.js

Node.js

Bootstrap / CSS modules for styling (adjust to your own stack)

## 🔹 Installation & Setup
1. Clone this repository:

2. Install dependencies:

npm install
3. Compile Solidity smart contracts:

npx hardhat compile
🔹 Deployment
To deploy the smart contract:

npx hardhat deploy
Save the deployed contract’s address afterwards — you’ll need it in your React application.

🔹 Run React Application

npm start
The application should be up and running at http://localhost:3000.

🔹 How To Use
✅ Add Candidate (Admin):

Connect MetaMask

Enter candidate’s name

Confirm transaction in MetaMask

Candidate is added to the list.

✅ Voting (Voter):

Connect MetaMask

Select your preferred candidate

Confirm transaction in MetaMask

Your vote is recorded (each voter can vote only once)

✅ Close Election (Admin):

The admin can close the election

This action prevents further voting

The results are displayed afterwards.

🔹 Screenshots

![alt text](<src/components/SCREENSHOTS/Screenshot 2025-05-27 171550.png>)

![alt text](<src/components/SCREENSHOTS/Screenshot 2025-05-27 171613.png>)

![alt text](<src/components/SCREENSHOTS/Screenshot 2025-05-27 171717.png>)

![alt text](<src/components/SCREENSHOTS/Screenshot 2025-05-27 171751.png>)

![alt text](<src/components/SCREENSHOTS/Screenshot 2025-05-27 171814.png>)

![alt text](<src/components/SCREENSHOTS/Screenshot 2025-05-27 171832.png>)

![alt text](<src/components/SCREENSHOTS/Screenshot 2025-05-27 172245.png>)


🔹Add Candidate View:

🔹Voting View:

🔹Election Result View:

🔹 Additional Notes
MetaMask is required to perform transactions.

The application runs on Hardhat’s local network by default.

Change network configuration in hardhat.config.js to deploy to a testnet or mainnet.# Sample Hardhat Project

This project demonstrates a basic Hardhat use case. It comes with a sample contract, a test for that contract, and a Hardhat Ignition module that deploys that contract.

Try running some of the following tasks:

```shell
npx hardhat help
npx hardhat test
REPORT_GAS=true npx hardhat test
npx hardhat node
npx hardhat ignition deploy ./ignition/modules/Lock.js
```
# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
