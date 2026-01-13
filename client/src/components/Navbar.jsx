import { useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <nav
      style={{
        padding: "14px 20px",
        borderBottom: "1px solid #e0e0e0",
        background: "#ffffff",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <strong style={{ fontSize: "25px", fontWeight: "750" }}>TravelMint</strong>
      <button onClick={logout}>Logout</button>
    </nav>
  );
}

export default Navbar;
