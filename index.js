document.addEventListener("DOMContentLoaded", () => {
  // login related
  const userNameInput = document.getElementById("username");
  const passwordInput = document.getElementById("password");
  const walletInput = document.getElementById("wallet");
  const confirmPasswordInput = document.getElementById("confirm-password");
  const showPasswordCheckbox = document.getElementById("show-password");
  const showAndHidePassContainer = document.getElementById(
    "show-and-hide-pass-container"
  );
  const loginText = document.getElementById("login-text");
  const registerText = document.getElementById("register-text");
  const registerButton = document.getElementById("register-button");
  const loginButton = document.getElementById("login-button");

  // toast related
  const toastContainer = document.getElementById("toast-container");

  // transaction related
  const creditBtn = document.getElementById("credit-label");
  const debitBtn = document.getElementById("debit-label");
  const creditRadioBtn = document.getElementById("credit-radio-btn");
  const debitRadioBtn = document.getElementById("debit-radio-btn");
  const amountInput = document.getElementById("amount");
  const descriptionInput = document.getElementById("description");
  const addTransactionBtn = document.getElementById("add-transaction");
  const reasonInput = document.getElementById("reason");

  // profie related
  const totalTransaction = document.getElementById("total-transaction");
  const userName = document.getElementById("user-name");
  const totalCredit = document.getElementById("total-credit");
  const totalDebit = document.getElementById("total-debit");
  const transactionBody = document.getElementById("transaction-body");

  // all models or forms
  const historyContainer = document.getElementById("history-container");
  const transactionsForm = document.getElementById("transaction-form");
  const loginRegisterForm = document.getElementById("login-register-form");

  // other buttons for navigation
  const closeHistoryBtn = document.getElementById("close-history");
  const profileBtn = document.getElementById("view-profile");

  // modal related buttons
  const detailModal = document.getElementById("details-modal");
  const closeModalBtn = document.querySelector(".close-btn");
  const modalDescription = document.getElementById("modal-description");
  const modalAmount = document.getElementById("modal-amount");
  const modalReason = document.getElementById("modal-reason");
  const modalType = document.getElementById("modal-type");
  const modalCreatedAt = document.getElementById("modal-createdAt");
  const modalBalanceBefore = document.getElementById("modal-balance-before");
  const modalBalanceAfter = document.getElementById("modal-balance-after");

  // database related
  let users = JSON.parse(localStorage.getItem("users")) || [];
  let userIndex;
  let currentPage = 1;

  // pagination related data
  const prevBtn = document.getElementById("prev-btn");
  const nextBtn = document.getElementById("next-btn");
  const pageInfo = document.getElementById("page-info");

  // Helper function to create toast messages
  function showToast(message, type = "success") {
    const toastHTML = `<div class="toast ${type}">${message} &nbsp; &nbsp;<span>&times;</span></div>`;
    toastContainer.insertAdjacentHTML("beforeend", toastHTML);

    const toast = toastContainer.lastElementChild;

    // Remove toast on click
    toast.querySelector("span").addEventListener("click", () => {
      toast.remove();
    });

    // Automatically remove toast after 5 seconds
    setTimeout(() => {
      toast.classList.add("fade-out");
      setTimeout(() => toast.remove(), 500);
    }, 3000);
  }

  // Function to register a user
  function registerUser(username, password, confirmPassword, wallet) {
    if (
      !username ||
      !password ||
      password !== confirmPassword ||
      isNaN(+wallet)
    ) {
      showToast("Registration failed: Check your inputs", "error");
      return;
    }

    if(username.trim().length < 5 ){
        showToast("Username must be at least 5 characters long", "error");
        return;
    }
    if(password.trim().length < 4){
        showToast("Password must be at least 4 characters long", "error");
        return;
    }
    const existingUser = users.find((user) => user.username === username);
    if (existingUser) {
      showToast("Registration failed: Username already exists", "error");
      return;
    }

    // Save user to localStorage
    const newUser = {
      username,
      password,
      totalCredit: 0,
      totalDebit: 0,
      wallet: +wallet,
      transactions: [],
    };
    userIndex = users.length + 1;
    users.push(newUser);
    localStorage.setItem("users", JSON.stringify(users));

    showToast("Registration successful", "success");

    hideLoginForm();
  }

  // Function to login a user
  function loginUser(username = "admin", password = "admin") {
    const user = users.filter((user, i) => {
      if (user.username === username && user.password === password) {
        userIndex = i + 1;
        return true;
      }
    })[0];
    if (user) {
      showToast("Login successful", "success");
      hideLoginForm();
    } else {
      showToast("Login failed: Invalid credentials", "error");
    }
  }
  // loginUser()

  // Function to hide login/register form and show transaction form
  function hideLoginForm(step) {
    if (step == 3) {
      historyContainer.style.display = "block";
      transactionsForm.style.display = "none";
    } else if (step == 2) {
      historyContainer.style.display = "none";
      transactionsForm.style.display = "block";
    } else {
      loginRegisterForm.style.display = "none";
      transactionsForm.style.display = "block";
    }
  }

  // function for halding the add transaction
  function handleAddTransaction(transaction) {
    if (!userIndex) {
      showToast("Please login or register first", "error");
      return false;
    }
    transaction.walletBefore = users[userIndex - 1].wallet;

    if (transaction.type == "credit") {
      users[userIndex - 1].totalCredit += transaction.amount;
      users[userIndex - 1].wallet += +transaction.amount;
      transaction.walletAfter = users[userIndex - 1].wallet;
    } else {
      users[userIndex - 1].totalDebit += transaction.amount;
      users[userIndex - 1].wallet -= +transaction.amount;
      transaction.walletAfter = users[userIndex - 1].wallet;
    }
    users[userIndex - 1].transactions.push(transaction);
    localStorage.setItem("users", JSON.stringify(users));
    return true;
  }

  // for settting transactions data on profile
  function setTransactionData() {
    const user = users[userIndex - 1];
    userName.innerText = user?.username?.toUpperCase();
    totalTransaction.textContent = `Wallet : ${user.wallet || 0}`;
    totalTransaction.style.color =
      user.wallet < 1000
        ? "#FF4C4C"
        : user.wallet < 5000
        ? "#FFA500"
        : user.wallet < 10000
        ? "#4CAF50"
        : "#1E90FF";
    totalCredit.textContent = `Total Credit : ${user.totalCredit}`;
    totalDebit.textContent = `Total Debit : ${user.totalDebit}`;
    pageInfo.textContent = currentPage;

    user.transactions.sort((a, b) => b.createdAt - a.createdAt);

    let data = user.transactions;
    let start = (currentPage - 1) * 5;
    let end = start + 5;
    let transactionHTML = [];
    for (let i = start; i < end; i++) {
      transactionHTML.push(`<tr>
                <td>${data[i] ? i + 1 : "..."}</td>
                <td id="transaction-time">${
                  data[i] ? formatDate(data[i].createdAt) : "..."
                }</td>
                <td ${data[i] ? "class=" + data[i].type : "..."}>${
        data[i] ? data[i].amount : "..."
      }</td>
                <td>${
                  data[i]
                    ? "<button class='details-btn' data-index='" +
                      i +
                      "'>Details</button>"
                    : "..."
                }</td>
                </tr> `);
    }

    transactionBody.innerHTML = transactionHTML.join("\n");

    document.querySelectorAll(".details-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const index = e.target.getAttribute("data-index");
        const transaction = user.transactions[index];
        showModal(transaction);
      });
    });
   
    prevBtn.disabled = currentPage === 1;
    nextBtn.disabled = (!user.transactions.length)? true : currentPage === Math.ceil(user.transactions.length / 5);
  }

  function showModal(transaction) {
    modalDescription.innerHTML = `<b>Description :</b> ${
      transaction.description || "N/A"
    }`;
    modalAmount.innerHTML = `<b>Amount : </b> ${transaction.amount}`;
    modalReason.innerHTML = `<b>Reason :</b> ${transaction.reason || "N/A"}`;
    modalType.innerHTML = `<b>Type :</b>  ${transaction.type}`;
    modalCreatedAt.innerHTML = `<b>Created At :</b>  ${formatDate(
      transaction.createdAt,
      true
    )}`;
    modalBalanceBefore.innerHTML = `<b>Balance Before :</b> ${transaction.walletBefore}`;
    modalBalanceAfter.innerHTML = `<b>Balance After : </b>${transaction.walletAfter}`;
    detailModal.style.display = "block";
  }

  // for formatting date
  function formatDate(date, second) {
    const d = new Date(date);

    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = String(d.getFullYear()).slice(-2);

    const hours = String(d.getHours()).padStart(2, "0");
    const minutes = String(d.getMinutes()).padStart(2, "0");
    const seconds = String(d.getSeconds()).padStart(2, "0");

    return ` ${hours}:${minutes}${
      second ? ":" + seconds : ""
    }, ${day}-${month}-${year}`;
  }

  // Event listeners for login and register buttons
  registerButton.addEventListener("click", () => {
    const username = userNameInput.value;
    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;
    const wallet = walletInput.value;
    registerUser(username, password, confirmPassword, wallet);
  });

  loginButton.addEventListener("click", () => {
    const username = userNameInput.value;
    const password = passwordInput.value;
    loginUser(username, password);
  });

  creditBtn.addEventListener("change", () => {
    debitBtn.style.color = "#333";
    creditBtn.style.color = "#4CAF50";
  });

  debitBtn.addEventListener("change", (e) => {
    creditBtn.style.color = "#333";
    debitBtn.style.color = "#FF4C4C";
  });

  loginText.addEventListener("click", () => {
    loginText.style.color = "#4CAF50";
    loginText.style.textDecoration = "underline";
    loginButton.style.display = "block";
    registerText.style.textDecoration = "none";
    registerText.style.color = "black";
    registerButton.style.display = "none";
    confirmPasswordInput.style.visibility = "hidden";
    walletInput.style.visibility = "hidden";
  });

  registerText.addEventListener("click", () => {
    registerText.style.color = "#4CAF50";
    registerText.style.textDecoration = "underline";
    registerButton.style.display = "block";
    loginButton.style.display = "none";
    loginText.style.color = "black";
    loginText.style.textDecoration = "none";
    confirmPasswordInput.style.visibility = "visible";
    walletInput.style.visibility = "visible";
  });

  profileBtn.addEventListener("click", () => {
    hideLoginForm(3);
    setTransactionData();
  });

  closeHistoryBtn.addEventListener("click", () => {
    hideLoginForm(2);
  });

  addTransactionBtn.addEventListener("click", () => {
    const amount = Number(amountInput.value);
    const description = descriptionInput.value;
    const reason = reasonInput.value;
    const type = creditRadioBtn.checked ? "credit" : "debit";

    if (!amount) {
      showToast("Please enter a vaild amount", "error");
      return;
    }
    if (!description) {
      showToast("Please enter a vaild description", "error");
      return;
    }

    // Add transaction to local storage
    const newTransaction = {
      amount,
      description,
      reason,
      type,
      createdAt: Date.now(),
    };

    let response = handleAddTransaction(newTransaction);
    if (!response) return;

    amountInput.value = "";
    descriptionInput.value = "";
    reasonInput.value = "";
    showToast("Transaction recorded successfully", "success");
  });

  // Show/Hide password functionality
  showPasswordCheckbox.addEventListener("click", (e) => {
    if (showPasswordCheckbox.src.includes("/hidePass")) {
      showPasswordCheckbox.src = "./images/icons8-show-password-48.png";
      passwordInput.type = "password";
    } else {
      showPasswordCheckbox.src = "./images/hidePass.png";
      passwordInput.type = "text";
    }
  });

  passwordInput.addEventListener("focus", () => {
    showAndHidePassContainer.style.border = "1px solid black";
  });

  passwordInput.addEventListener("blur", () => {
    showAndHidePassContainer.style.border = "1px solid #ccc";
  });

  // Event listeners for pagination buttons
  prevBtn.addEventListener("click", () => {
    if (currentPage > 1) {
      currentPage--;
      setTransactionData();
    }
  });

  nextBtn.addEventListener("click", () => {
    if (currentPage < Math.ceil(users[userIndex - 1].transactions.length / 5)) {
      currentPage++;
      setTransactionData();
    }
  });

  // Function to close the modal
  closeModalBtn.addEventListener("click", () => {
    detailModal.style.display = "none";
  });
});
