document.addEventListener("DOMContentLoaded", () => {
    const registerForm = document.getElementById("register-form");
  
    registerForm.addEventListener("submit", async (event) => {
      event.preventDefault();
  
      const username = document.getElementById("username").value.trim();
      const email = document.getElementById("email").value.trim();
      const password = document.getElementById("password").value.trim();
  
      try {
        const response = await axios.post("http://localhost:3000/auth/register", {
          username,
          email,
          password
        }, {
          headers: {
            "Content-Type": "application/json"
          },
          withCredentials: true
        });
  
        console.log("Registration response:", response.data);
  
        // Show success message
        alert("✅ Registration successful! Please login.");
        
        // Redirect to login page
        window.location.href = "index.html";
      } catch (error) {
        console.error("Registration failed:", error.response?.data || error.message);
  
        // Display error message to user
        alert("❌ Registration failed: " + (error.response?.data?.error || "Please try again."));
      }
    });
  });
  