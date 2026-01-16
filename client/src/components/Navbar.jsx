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
        borderBottom: "1px solid #e0dcdc",
        background: "#ffffff",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <strong style={{ fontSize: "26px", fontWeight: "780", color: "#057451" }}> 🌍
         TravelMint</strong>
      <button onClick={logout}>Logout</button>
    </nav>
  );
}

export default Navbar;
