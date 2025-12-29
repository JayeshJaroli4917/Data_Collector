const loginBtn = document.getElementById("loginBtn");
const usernameInput = document.getElementById("username");

const emailRegex = /^[a-zA-Z0-9._]+@(diu\.)?iiitvadodara\.ac\.in$/;

loginBtn.onclick = () => {
  const username = usernameInput.value.trim().toLowerCase();

  if (!emailRegex.test(username)) {
    alert("Enter valid institute email");
    return;
  }

  // Save user
  localStorage.setItem("loggedInUser", username);

  // Go to test page
  window.location.href = "test.html";
};
