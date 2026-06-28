import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

export default function VerifyEmail() {
    const { token } = useParams();
    const navigate = useNavigate();

    const [message, setMessage] = useState("Verifying your email...");

    useEffect(() => {
        const verify = async () => {
            try {
                const API =
                    import.meta.env.VITE_API_BASE_URL ||
                    "http://localhost:5000/api";

                const res = await axios.get(
                    `${API}/auth/verify/${token}`
                );

                setMessage(res.data.message);

                setTimeout(() => {
                    navigate("/");
                }, 3000);

            } catch (err) {
                setMessage(
                    err.response?.data?.message ||
                    "Verification failed."
                );
            }
        };

        verify();
    }, [token, navigate]);

    return (
        <div
            style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "100vh",
                fontSize: "22px",
                fontWeight: "bold"
            }}
        >
            {message}
        </div>
    );
}