async function testRegister() {
  try {
    const res = await fetch("http://localhost:8787/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "john.doe@remotefix.com",
        password: "Password123!",
        fullName: "John Doe",
        phone: "1234567890",
        companyName: "RemoteFix Inc"
      })
    });
    const data = await res.json();
    console.log("==========================================");
    console.log("Registration API Response:");
    console.log(JSON.stringify(data, null, 2));
    console.log("==========================================");
  } catch (err) {
    console.error("Error:", err);
  }
}

testRegister();
