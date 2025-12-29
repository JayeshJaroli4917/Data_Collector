const loginBtn = document.getElementById("loginBtn");
const usernameInput = document.getElementById("username");

const emailRegex = /^[a-zA-Z0-9._]+@(diu\.)?iiitvadodara\.ac\.in$/;

loginBtn.onclick = () => {
  const username = usernameInput.value.trim().toLowerCase();

  if (!emailRegex.test(username)) {
    alert("Enter valid institute email: <enrollment>@diu.iiitvadodara.ac.in");
    return;
  }

  // Save username for test page
  localStorage.setItem("loggedInUser", username);

  // Redirect to test page
  window.location.href = "test.html";
};
