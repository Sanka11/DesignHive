import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { BeatLoader } from "react-spinners";


export default function OAuthRedirect() {
    const { handleOAuthRedirect, loading } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = useState(null);

    useEffect(() => {
        const processOAuth = async () => {
            try {
                await handleOAuthRedirect();
                
                // Redirect to dashboard or previous location
                const redirectTo = sessionStorage.getItem('preAuthRoute') || '/dashboard';
                navigate(redirectTo);
                
            } catch (err) {
                console.error("OAuth processing failed:", err);
                setError("Failed to complete authentication. Please try again.");
                setTimeout(() => navigate("/login"), 3000);
            }
        };

        processOAuth();
    }, [navigate, handleOAuthRedirect]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
            <div className="p-8 bg-white rounded-lg shadow-md text-center max-w-md w-full">
                {loading || !error ? (
                    <>
                        <BeatLoader color="#3b82f6" size={15} className="my-4" />
                        <h2 className="text-xl font-semibold text-gray-800">
                            Completing authentication...
                        </h2>
                        <p className="text-gray-600 mt-2">
                            Please wait while we verify your account
                        </p>
                    </>
                ) : (
                    <>
                        <div className="text-red-500 mb-4">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-12 w-12 mx-auto"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                            </svg>
                            <p className="mt-2">{error}</p>
                        </div>
                        <p className="text-gray-500 text-sm">
                            Redirecting to login page...
                        </p>
                    </>
                )}
            </div>
        </div>
    );
}