import { Link } from "react-router-dom";
import logo from "../imgs/logo-diverkids.png";

function Navbar() {
    return (
        <nav className="navbar">
            <Link to="/">
                <img src={logo} alt="Logo DiverKids" className="logo" />
            </Link>
        </nav>
    );
}

export default Navbar;
