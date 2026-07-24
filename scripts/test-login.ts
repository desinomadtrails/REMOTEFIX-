async function testLogin() {
  try {
    const res = await fetch("http://localhost:8787/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "john.doe@remotefix.com",
        password: "Password123!"
      })
    });
    const data = await res.json();
    console.log("==========================================");
    console.log("Login API Response:");
    console.log(JSON.stringify(data, null, 2));
    console.log("==========================================");
  } catch (err) {
    console.error("Error:", err);
  }
}

testLogin();
