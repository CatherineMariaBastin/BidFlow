import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

function Register() {
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const updateForm = (field, value) => {
    setForm({
      ...form,
      [field]: value,
    });
  };

  const registerUser = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      await API.post("/auth/register", form);
      alert("Registration Successful. Please login.");
      navigate("/");
    } catch (err) {
      setError(
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Registration failed. Check backend and MySQL."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5">
      <div className="mx-auto card shadow" style={{ maxWidth: "420px" }}>
        <div className="card-body">
          <h2 className="mb-4">Create Account</h2>

          <form onSubmit={registerUser}>
            <input
              className="form-control mb-3"
              placeholder="Username"
              value={form.username}
              onChange={(e) => updateForm("username", e.target.value)}
            />

            <input
              className="form-control mb-3"
              placeholder="Email"
              value={form.email}
              onChange={(e) => updateForm("email", e.target.value)}
            />

            <input
              className="form-control mb-3"
              type="password"
              placeholder="Password"
              value={form.password}
              onChange={(e) => updateForm("password", e.target.value)}
            />

            {error && (
              <div className="alert alert-danger py-2">
                {error}
              </div>
            )}

            <button
              className="btn btn-primary w-100"
              type="submit"
              disabled={loading}
            >
              {loading ? "Creating..." : "Register"}
            </button>
          </form>

          <button
            type="button"
            className="btn btn-link mt-3"
            onClick={() => navigate("/")}
          >
            Back to login
          </button>
        </div>
      </div>
    </div>
  );
}

export default Register;
