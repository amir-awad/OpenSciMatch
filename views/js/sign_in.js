document.addEventListener("DOMContentLoaded", function () {
  const submitButton = document.getElementById("submit-button");

  submitButton.addEventListener("click", async function (event) {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const userRole = document.getElementById("user-role").value;
    const data = {
      email,
      password,
      userRole,
    };

    await axios({
      method: "post",
      url: "/api/v1/auth/login",
      data: data,
      validateStatus: () => true,
    })
      .then((response) => {
        if (response.status === 201) {
          const { user, role, matchedUsers } = response.data;
          if (role == "contributor") {
            // route to the 
          }
        } else {
          alert("Invalid credentials");
        }
      })
      .catch((error) => {
        alert(error.response.data.msg);
      });
  });
});
